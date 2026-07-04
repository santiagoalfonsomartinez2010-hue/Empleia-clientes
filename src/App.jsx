import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import Hero from './components/Hero'
import Panel from './components/Panel'
import ModalApiKey from './components/ModalApiKey'
import { inferirTipoArchivo } from './lib/parseArchivo'
import { analizarFuente, generarResumenGlobal } from './lib/gemini'
import {
  cargarFuentes,
  guardarFuentes,
  cargarResumen,
  guardarResumen,
  cargarApiKey,
  guardarApiKey,
  vaciarTodo,
} from './lib/almacen'
import { fuentesDeEjemplo, resumenDeEjemplo } from './lib/ejemplo'
import './App.css'

/*
  Panel Unificado de Empleia (demo).

  Flujo: el usuario sube archivos sueltos (Excel, PDF, imágenes, calendarios…),
  cada uno se manda a la API de Gemini, que lo devuelve normalizado (título,
  categoría, tabla, eventos y métricas), y el panel agrega todas las fuentes en
  un único dashboard. Sin backend: la persistencia es localStorage.
*/

let contadorId = 0
const nuevoId = () => `f-${Date.now()}-${contadorId++}`

export default function App() {
  const [fuentes, setFuentes] = useState(() => cargarFuentes())
  const [resumen, setResumen] = useState(() => cargarResumen())
  const [apiKey, setApiKey] = useState(() => cargarApiKey())
  const [modalKeyAbierto, setModalKeyAbierto] = useState(false)
  const [generandoResumen, setGenerandoResumen] = useState(false)
  const [avisoResumen, setAvisoResumen] = useState(null)

  const inputArchivosRef = useRef(null)
  const panelRef = useRef(null)

  // Persistencia automática en localStorage
  useEffect(() => {
    guardarFuentes(fuentes)
  }, [fuentes])
  useEffect(() => {
    guardarResumen(resumen)
  }, [resumen])

  // Abre el selector de archivos (pidiendo antes la API key si falta)
  function pedirArchivos() {
    if (!apiKey) {
      setModalKeyAbierto(true)
      return
    }
    inputArchivosRef.current?.click()
  }

  /*
    Procesa una lista de archivos: crea cada fuente en estado "procesando" y
    las analiza en serie (la capa gratuita de Gemini limita las peticiones por
    minuto, así que en paralelo fallarían con lotes grandes).
  */
  async function procesarArchivos(lista) {
    const archivos = Array.from(lista || [])
    if (archivos.length === 0) return
    if (!apiKey) {
      setModalKeyAbierto(true)
      return
    }

    const nuevas = archivos.map((archivo) => ({
      id: nuevoId(),
      nombreArchivo: archivo.name,
      tipoArchivo: inferirTipoArchivo(archivo.name),
      estado: 'procesando',
      creado: Date.now(),
    }))
    setFuentes((previas) => [...previas, ...nuevas])
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    for (let i = 0; i < archivos.length; i++) {
      const meta = nuevas[i]
      try {
        const resultado = await analizarFuente(archivos[i], meta.tipoArchivo, apiKey)
        setFuentes((previas) =>
          previas.map((f) => (f.id === meta.id ? { ...f, estado: 'listo', resultado } : f))
        )
      } catch (error) {
        setFuentes((previas) =>
          previas.map((f) => (f.id === meta.id ? { ...f, estado: 'error', error: error.message } : f))
        )
      }
    }
  }

  // Resumen global: cruza todas las fuentes ya procesadas con una segunda llamada
  async function generarResumen() {
    const listas = fuentes.filter((f) => f.estado === 'listo')
    if (listas.length === 0) return
    if (!apiKey) {
      setModalKeyAbierto(true)
      return
    }
    setGenerandoResumen(true)
    setAvisoResumen(null)
    try {
      setResumen(await generarResumenGlobal(listas, apiKey))
    } catch (error) {
      setAvisoResumen(error.message)
    } finally {
      setGenerandoResumen(false)
    }
  }

  // Carga las cuatro fuentes simuladas (para enseñar la demo sin API key)
  function cargarEjemplo() {
    setFuentes(fuentesDeEjemplo())
    setResumen(resumenDeEjemplo())
    setAvisoResumen(null)
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function vaciarPanel() {
    if (!window.confirm('¿Vaciar el panel? Se quitarán todas las fuentes y el resumen.')) return
    setFuentes([])
    setResumen(null)
    setAvisoResumen(null)
    vaciarTodo()
  }

  function quitarFuente(id) {
    setFuentes((previas) => previas.filter((f) => f.id !== id))
  }

  function guardarKey(key) {
    guardarApiKey(key)
    setApiKey(key)
    setModalKeyAbierto(false)
  }

  return (
    <div className="app">
      <Sidebar
        fuentes={fuentes}
        hayApiKey={Boolean(apiKey)}
        onAnadir={pedirArchivos}
        onEjemplo={cargarEjemplo}
        onVaciar={vaciarPanel}
        onApiKey={() => setModalKeyAbierto(true)}
      />

      <main className="app-principal">
        <Hero
          hayFuentes={fuentes.length > 0}
          onArchivosSoltados={procesarArchivos}
          onPedirArchivos={pedirArchivos}
          onEjemplo={cargarEjemplo}
        />
        <div ref={panelRef}>
          <Panel
            fuentes={fuentes}
            resumen={resumen}
            generandoResumen={generandoResumen}
            avisoResumen={avisoResumen}
            onGenerarResumen={generarResumen}
            onQuitarFuente={quitarFuente}
            onPedirArchivos={pedirArchivos}
            onEjemplo={cargarEjemplo}
          />
        </div>
      </main>

      {/* Selector de archivos oculto, compartido por sidebar y hero */}
      <input
        ref={inputArchivosRef}
        type="file"
        multiple
        hidden
        accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp,.gif,.ics,.json,.txt,.md"
        onChange={(e) => {
          procesarArchivos(e.target.files)
          e.target.value = ''
        }}
      />

      {modalKeyAbierto && (
        <ModalApiKey
          onGuardar={guardarKey}
          onCerrar={() => setModalKeyAbierto(false)}
          onEjemplo={() => {
            setModalKeyAbierto(false)
            cargarEjemplo()
          }}
        />
      )}
    </div>
  )
}
