import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import ZonaTrabajo from './components/ZonaTrabajo'
import { clientesIniciales, plantillasSubida } from './data/clientesMock'

// Checklist por defecto que recibe un cliente recién creado (todo pendiente)
const checklistPorDefecto = () => [
  { id: 'proveedores', etiqueta: 'Proveedores', registros: 0, completo: false },
  { id: 'equipo', etiqueta: 'Equipo', registros: 0, completo: false },
  { id: 'faqs', etiqueta: 'FAQs', registros: 0, completo: false },
  { id: 'catalogo', etiqueta: 'Catálogo de servicios', registros: 0, completo: false },
  { id: 'gmail', etiqueta: 'Conectar Gmail', registros: 0, completo: false },
]

// Genera las iniciales del avatar a partir del nombre del cliente
const generarInicial = (nombre) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?'

export default function App() {
  // Lista de clientes (en FASE 2 vendrá del backend)
  const [clientes, setClientes] = useState(clientesIniciales)
  // Cliente seleccionado actualmente
  const [clienteActivoId, setClienteActivoId] = useState(clientesIniciales[0].id)
  // Documento expandido dentro del cliente activo
  const [docExpandidoId, setDocExpandidoId] = useState(null)

  const clienteActivo = clientes.find((c) => c.id === clienteActivoId) || null

  // Selecciona un cliente y colapsa cualquier documento abierto
  const seleccionarCliente = (id) => {
    setClienteActivoId(id)
    setDocExpandidoId(null)
  }

  // Crea un cliente nuevo y lo deja seleccionado
  const nuevoCliente = () => {
    const nombre = window.prompt('Nombre del nuevo cliente:')
    if (!nombre || !nombre.trim()) return

    const nuevo = {
      id: `cliente-${Date.now()}`,
      nombre: nombre.trim(),
      progreso: 0,
      inicial: generarInicial(nombre),
      color: '#f59e0b', // amarillo para diferenciar a los recién creados
      documentos: [],
      checklist: checklistPorDefecto(),
    }
    setClientes((prev) => [...prev, nuevo])
    setClienteActivoId(nuevo.id)
    setDocExpandidoId(null)
  }

  // Expande / colapsa un documento procesado
  const toggleDoc = (docId) => {
    setDocExpandidoId((actual) => (actual === docId ? null : docId))
  }

  /*
    Simula la subida de un archivo: añade un documento en estado
    "procesando" al cliente activo y, tras 2 segundos, lo pasa a
    "procesado" rellenándolo con los datos de ejemplo de la plantilla.
  */
  const simularSubida = (tipo) => {
    if (!clienteActivo) return
    const plantilla = plantillasSubida[tipo]
    if (!plantilla) return

    const idDoc = `doc-${Date.now()}`
    const clienteId = clienteActivo.id

    // 1) Añadimos el documento "procesando" (sin datos todavía)
    const docProcesando = {
      id: idDoc,
      nombre: plantilla.nombre,
      tipo: plantilla.tipo,
      estado: 'procesando',
      deteccion: 'Analizando documento…',
      columnas: plantilla.columnas,
      filas: [],
    }
    setClientes((prev) =>
      prev.map((c) =>
        c.id === clienteId ? { ...c, documentos: [docProcesando, ...c.documentos] } : c
      )
    )

    // 2) A los 2 segundos pasa a "procesado" con los datos extraídos
    setTimeout(() => {
      setClientes((prev) =>
        prev.map((c) => {
          if (c.id !== clienteId) return c
          return {
            ...c,
            documentos: c.documentos.map((d) =>
              d.id === idDoc
                ? {
                    ...d,
                    estado: 'procesado',
                    deteccion: plantilla.deteccion,
                    filas: plantilla.filas,
                  }
                : d
            ),
          }
        })
      )
    }, 2000)
  }

  // Confirmar e insertar los datos previsualizados (simulado en FASE 1)
  const confirmarDocumento = (documento) => {
    const registros = documento.filas.length
    window.alert(
      `✅ ${registros} registro(s) de "${documento.nombre}" confirmados e insertados (simulado).`
    )
  }

  // Editar los datos previsualizados (simulado en FASE 1)
  const editarDocumento = (documento) => {
    window.alert(`✏️ Modo edición de "${documento.nombre}" (pendiente para la FASE 2).`)
  }

  return (
    <div className="app">
      <Sidebar
        clientes={clientes}
        clienteActivoId={clienteActivoId}
        onSeleccionarCliente={seleccionarCliente}
        onNuevoCliente={nuevoCliente}
      />
      <ZonaTrabajo
        cliente={clienteActivo}
        docExpandidoId={docExpandidoId}
        onToggleDoc={toggleDoc}
        onSimularSubida={simularSubida}
        onConfirmar={confirmarDocumento}
        onEditar={editarDocumento}
      />
    </div>
  )
}
