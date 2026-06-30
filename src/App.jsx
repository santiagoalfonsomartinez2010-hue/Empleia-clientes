import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ZonaTrabajo from './components/ZonaTrabajo'
import ModalNuevoCliente from './components/ModalNuevoCliente'
import { generarInicial, colorCliente } from './lib/visuales'
import { inferirTipoArchivo } from './lib/parseArchivo'
import { analizarDocumento } from './lib/anthropic'
import { marcarDuplicados } from './lib/similitud'
import { configDeTipo } from './lib/tiposDeteccion'
import * as servicio from './services/onboardingService'

// Convierte una fila de clientes_empresa al modelo que usan los componentes
function mapearCliente(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    sector: fila.sector,
    ciudad: fila.ciudad,
    progreso: fila.porcentaje_completado ?? 0,
    inicial: generarInicial(fila.nombre),
    color: colorCliente(fila.nombre),
    documentos: [],
    checklist: [],
  }
}

// Convierte un registro de documentos_procesados a una card "histórica"
function mapearDocumento(d) {
  return {
    id: d.id,
    nombre: d.nombre_archivo,
    tipo: inferirTipoArchivo(d.nombre_archivo), // para el icono
    estado: 'procesado',
    historico: true, // ya insertado: no se vuelve a confirmar
    deteccion: `${d.registros_extraidos ?? 0} ${d.tipo_detectado || 'registros'} · ${
      d.duplicados_detectados ?? 0
    } duplicado(s)`,
    columnas: [],
    filas: [],
  }
}

export default function App() {
  const [clientes, setClientes] = useState([])
  const [clienteActivoId, setClienteActivoId] = useState(null)
  const [docExpandidoId, setDocExpandidoId] = useState(null)
  const [cargandoClientes, setCargandoClientes] = useState(true)
  const [errorGlobal, setErrorGlobal] = useState(null)
  const [totalMigradoHoy, setTotalMigradoHoy] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [aviso, setAviso] = useState(null) // toast: { tipo: 'ok'|'error', texto }
  // IDs de clientes cuyo detalle ya se ha pedido (evita cargas duplicadas)
  const detalleSolicitado = useRef(new Set())

  const clienteActivo = clientes.find((c) => c.id === clienteActivoId) || null

  // Muestra un aviso temporal (toast) que desaparece a los 3,5 segundos
  const mostrarAviso = useCallback((tipo, texto) => {
    setAviso({ tipo, texto })
    setTimeout(() => setAviso(null), 3500)
  }, [])

  // Aplica cambios a un documento concreto dentro de un cliente
  const actualizarDoc = useCallback((clienteId, docId, cambios) => {
    setClientes((prev) =>
      prev.map((c) =>
        c.id !== clienteId
          ? c
          : {
              ...c,
              documentos: c.documentos.map((d) => (d.id === docId ? { ...d, ...cambios } : d)),
            }
      )
    )
  }, [])

  // 1) Al cargar la app: traer la lista real de clientes y el total migrado hoy
  useEffect(() => {
    let activo = true
    ;(async () => {
      try {
        const [filas, total] = await Promise.all([
          servicio.listarClientes(),
          servicio.contarMigradoHoy().catch(() => 0),
        ])
        if (!activo) return
        const mapeados = filas.map(mapearCliente)
        setClientes(mapeados)
        setTotalMigradoHoy(total)
        if (mapeados.length > 0) setClienteActivoId(mapeados[0].id)
      } catch (err) {
        if (activo) setErrorGlobal('No se pudieron cargar los clientes: ' + err.message)
      } finally {
        if (activo) setCargandoClientes(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [])

  // 2) Cuando cambia el cliente activo, cargar su detalle (documentos + checklist)
  //    una sola vez por cliente (el ref evita peticiones duplicadas).
  useEffect(() => {
    if (!clienteActivoId) return
    if (detalleSolicitado.current.has(clienteActivoId)) return
    detalleSolicitado.current.add(clienteActivoId)

    let activo = true
    ;(async () => {
      try {
        const [docs, { items, porcentaje }] = await Promise.all([
          servicio.listarDocumentos(clienteActivoId),
          servicio.construirChecklist(clienteActivoId),
        ])
        if (!activo) return
        setClientes((prev) =>
          prev.map((c) =>
            c.id !== clienteActivoId
              ? c
              : { ...c, documentos: docs.map(mapearDocumento), checklist: items, progreso: porcentaje }
          )
        )
      } catch (err) {
        detalleSolicitado.current.delete(clienteActivoId) // permitir reintento
        if (activo) mostrarAviso('error', 'Error al cargar el cliente: ' + err.message)
      }
    })()
    return () => {
      activo = false
    }
  }, [clienteActivoId, mostrarAviso])

  // Selecciona un cliente y colapsa el documento abierto
  const seleccionarCliente = (id) => {
    setClienteActivoId(id)
    setDocExpandidoId(null)
  }

  // Crea un cliente real en Supabase y lo deja seleccionado
  const crearCliente = async (datos) => {
    const fila = await servicio.crearCliente(datos)
    const nuevo = mapearCliente(fila)
    setClientes((prev) => [nuevo, ...prev])
    setClienteActivoId(nuevo.id)
    setDocExpandidoId(null)
    setModalAbierto(false)
    mostrarAviso('ok', `Cliente "${fila.nombre}" creado.`)
  }

  // Expande / colapsa un documento
  const toggleDoc = (docId) => {
    setDocExpandidoId((actual) => (actual === docId ? null : docId))
  }

  /*
    Sube y analiza archivos reales: por cada archivo añade una card en estado
    "procesando", lo manda a la API de Anthropic, detecta duplicados contra la
    base de datos y muestra la previsualización con los datos extraídos.
  */
  const procesarArchivos = useCallback(
    async (archivos) => {
      if (!clienteActivo) return
      const clienteId = clienteActivo.id

      for (const file of archivos) {
        const idDoc = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const tipoArchivo = inferirTipoArchivo(file.name)

        // 1) Card en estado "procesando" (no se queda en blanco)
        const docProcesando = {
          id: idDoc,
          nombre: file.name,
          tipo: tipoArchivo,
          estado: 'procesando',
          deteccion: 'Analizando documento…',
          historico: false,
          columnas: [],
          filas: [],
        }
        setClientes((prev) =>
          prev.map((c) =>
            c.id === clienteId ? { ...c, documentos: [docProcesando, ...c.documentos] } : c
          )
        )

        try {
          // 2) Analizar el documento con la API de Anthropic
          const { tipo, registros } = await analizarDocumento(file, tipoArchivo)
          const config = configDeTipo(tipo)
          if (!config) throw new Error(`Tipo de datos no reconocido: ${tipo}`)

          // 3) Detectar duplicados contra lo que ya hay en la BD para este cliente
          const existentes = await servicio.obtenerValoresExistentes(tipo, clienteId)
          const filasMarcadas = marcarDuplicados(registros, existentes, config.campoClave)
          const duplicados = filasMarcadas.filter((f) => f.__duplicado).length

          // 4) Pasar la card a "procesado" con los datos extraídos
          actualizarDoc(clienteId, idDoc, {
            estado: 'procesado',
            tipoDetectado: tipo,
            columnas: config.columnas,
            filas: filasMarcadas,
            deteccion: `${filasMarcadas.length} ${config.etiqueta} detectados${
              duplicados ? ` · ${duplicados} duplicado(s) unificado(s)` : ''
            }`,
          })
          setDocExpandidoId(idDoc) // se abre para previsualizar
        } catch (err) {
          // Error al analizar: la card lo refleja en vez de quedarse colgada
          actualizarDoc(clienteId, idDoc, {
            estado: 'error',
            deteccion: 'Error al analizar: ' + err.message,
          })
          mostrarAviso('error', err.message)
        }
      }
    },
    [clienteActivo, actualizarDoc, mostrarAviso]
  )

  /*
    Confirma e inserta los datos previsualizados:
     a) inserta las filas no duplicadas en la tabla correspondiente,
     b) registra el documento en documentos_procesados,
     c) actualiza el porcentaje del cliente,
     d) refresca documentos y checklist con datos reales.
  */
  const confirmarDocumento = async (documento) => {
    if (!clienteActivo) return
    const clienteId = clienteActivo.id
    const config = configDeTipo(documento.tipoDetectado)
    if (!config) return

    const noDuplicados = documento.filas.filter((f) => !f.__duplicado)
    const duplicados = documento.filas.length - noDuplicados.length

    try {
      // a) Insertar los registros no duplicados
      if (noDuplicados.length > 0) {
        await servicio.insertarRegistros(documento.tipoDetectado, clienteId, noDuplicados)
      }
      // b) Registrar el documento procesado
      await servicio.registrarDocumento({
        clienteId,
        nombreArchivo: documento.nombre,
        tipoDetectado: documento.tipoDetectado,
        registrosExtraidos: noDuplicados.length,
        duplicadosDetectados: duplicados,
      })
      // c) Recalcular y guardar el porcentaje del cliente
      const { items, porcentaje } = await servicio.construirChecklist(clienteId)
      await servicio.actualizarPorcentaje(clienteId, porcentaje)
      // d) Refrescar documentos y total migrado hoy
      const [docs, total] = await Promise.all([
        servicio.listarDocumentos(clienteId),
        servicio.contarMigradoHoy().catch(() => totalMigradoHoy),
      ])

      setClientes((prev) =>
        prev.map((c) =>
          c.id !== clienteId
            ? c
            : { ...c, documentos: docs.map(mapearDocumento), checklist: items, progreso: porcentaje }
        )
      )
      setTotalMigradoHoy(total)
      setDocExpandidoId(null)
      mostrarAviso('ok', `${noDuplicados.length} registro(s) insertado(s) correctamente.`)
    } catch (err) {
      mostrarAviso('error', 'No se pudo insertar: ' + err.message)
    }
  }

  // Editar los datos previsualizados (pendiente para una iteración futura)
  const editarDocumento = (documento) => {
    mostrarAviso('ok', `La edición manual de "${documento.nombre}" llegará en una próxima versión.`)
  }

  return (
    <div className="app">
      <Sidebar
        clientes={clientes}
        clienteActivoId={clienteActivoId}
        cargando={cargandoClientes}
        totalMigradoHoy={totalMigradoHoy}
        onSeleccionarCliente={seleccionarCliente}
        onNuevoCliente={() => setModalAbierto(true)}
      />

      {errorGlobal ? (
        <main className="app__error-global">{errorGlobal}</main>
      ) : (
        <ZonaTrabajo
          cliente={clienteActivo}
          cargando={cargandoClientes}
          docExpandidoId={docExpandidoId}
          onToggleDoc={toggleDoc}
          onProcesarArchivos={procesarArchivos}
          onConfirmar={confirmarDocumento}
          onEditar={editarDocumento}
        />
      )}

      {modalAbierto && (
        <ModalNuevoCliente onCerrar={() => setModalAbierto(false)} onCrear={crearCliente} />
      )}

      {/* Toast de avisos (éxito / error) */}
      {aviso && <div className={`toast toast--${aviso.tipo}`}>{aviso.texto}</div>}
    </div>
  )
}
