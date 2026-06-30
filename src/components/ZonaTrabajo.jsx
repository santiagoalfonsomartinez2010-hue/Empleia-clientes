import { useState, useRef } from 'react'
import './ZonaTrabajo.css'
import DocumentoCard from './DocumentoCard'
import Checklist from './Checklist'
import { IconoSubir } from './Iconos'

/*
  COLUMNA 2 — Zona de trabajo (flex: 1).
  Contiene el selector del cliente activo, la zona de arrastrar/subir
  documentos REALES (Excel, CSV, PDF o imágenes), la lista de documentos
  procesados y el checklist. Sin chat: es una herramienta de trabajo.
*/
export default function ZonaTrabajo({
  cliente,
  cargando,
  docExpandidoId,
  onToggleDoc,
  onProcesarArchivos,
  onConfirmar,
  onEditar,
}) {
  // Estado visual del arrastre sobre la zona de subida
  const [arrastrando, setArrastrando] = useState(false)
  // Referencia al input de archivo oculto (lo abre el botón)
  const inputRef = useRef(null)

  // Procesa los archivos soltados sobre la zona
  const manejarDrop = (e) => {
    e.preventDefault()
    setArrastrando(false)
    const archivos = Array.from(e.dataTransfer.files || [])
    if (archivos.length > 0) onProcesarArchivos(archivos)
  }

  // Procesa los archivos elegidos desde el explorador
  const manejarSeleccion = (e) => {
    const archivos = Array.from(e.target.files || [])
    if (archivos.length > 0) onProcesarArchivos(archivos)
    e.target.value = '' // permite volver a subir el mismo archivo
  }

  if (cargando) {
    return (
      <main className="zona">
        <div className="zona__vacio">Cargando…</div>
      </main>
    )
  }

  if (!cliente) {
    return (
      <main className="zona">
        <div className="zona__vacio">
          Crea o selecciona un cliente en la barra lateral para empezar.
        </div>
      </main>
    )
  }

  return (
    <main className="zona">
      {/* Selector / cabecera del cliente activo */}
      <header className="zona__selector">
        <div className="zona__selector-info">
          <span className="zona__selector-avatar" style={{ backgroundColor: cliente.color }}>
            {cliente.inicial}
          </span>
          <div>
            <p className="zona__selector-label">Cliente activo</p>
            <h2 className="zona__selector-nombre">{cliente.nombre}</h2>
          </div>
        </div>
        <div className="zona__selector-progreso">
          <span className="zona__selector-pct">{cliente.progreso}%</span>
          <span className="zona__selector-pct-label">completado</span>
        </div>
      </header>

      <div className="zona__scroll">
        {/* Zona de arrastrar o subir documentos reales */}
        <div
          className={`zona-subida ${arrastrando ? 'zona-subida--activa' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={manejarDrop}
        >
          <span className="zona-subida__icono">
            <IconoSubir />
          </span>
          <p className="zona-subida__texto">Arrastra o sube documentos aquí</p>
          <p className="zona-subida__sub">Excel, CSV, PDF o imágenes · se analizan automáticamente</p>

          {/* Input de archivo oculto + botón que lo dispara */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".xlsx,.xls,.csv,.pdf,image/*"
            onChange={manejarSeleccion}
            style={{ display: 'none' }}
          />
          <div className="zona-subida__botones">
            <button
              type="button"
              className="zona-subida__btn"
              onClick={() => inputRef.current?.click()}
            >
              Seleccionar archivo
            </button>
          </div>
        </div>

        {/* Lista de documentos procesados */}
        <section className="zona__seccion">
          <h3 className="zona__titulo">
            Documentos procesados
            <span className="zona__titulo-contador">{cliente.documentos.length}</span>
          </h3>

          {cliente.documentos.length === 0 ? (
            <p className="zona__sin-docs">Todavía no hay documentos para este cliente.</p>
          ) : (
            <div className="zona__docs">
              {cliente.documentos.map((doc) => (
                <DocumentoCard
                  key={doc.id}
                  documento={doc}
                  expandido={doc.id === docExpandidoId}
                  onToggle={onToggleDoc}
                  onConfirmar={onConfirmar}
                  onEditar={onEditar}
                />
              ))}
            </div>
          )}
        </section>

        {/* Checklist del cliente activo (datos reales) */}
        <Checklist items={cliente.checklist} />
      </div>
    </main>
  )
}
