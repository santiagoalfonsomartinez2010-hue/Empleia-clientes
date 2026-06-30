import { useState } from 'react'
import './ZonaTrabajo.css'
import DocumentoCard from './DocumentoCard'
import Checklist from './Checklist'
import { IconoSubir } from './Iconos'

/*
  COLUMNA 2 — Zona de trabajo (flex: 1).
  Contiene el selector del cliente activo, la zona de arrastrar/subir
  documentos, la lista de documentos procesados hoy y el checklist.
  Sin chat: es una herramienta de trabajo, no de conversación.
*/
export default function ZonaTrabajo({
  cliente,
  docExpandidoId,
  onToggleDoc,
  onSimularSubida,
  onConfirmar,
  onEditar,
}) {
  // Estado visual del arrastre sobre la zona de subida
  const [arrastrando, setArrastrando] = useState(false)

  // Maneja el "drop" de archivos reales: como no hay backend, simulamos
  // la subida tomando la extensión para elegir el tipo de plantilla.
  const manejarDrop = (e) => {
    e.preventDefault()
    setArrastrando(false)
    const archivo = e.dataTransfer.files?.[0]
    if (!archivo) return
    const nombre = archivo.name.toLowerCase()
    let tipo = 'imagen'
    if (nombre.endsWith('.xlsx') || nombre.endsWith('.xls') || nombre.endsWith('.csv')) tipo = 'excel'
    else if (nombre.endsWith('.pdf')) tipo = 'pdf'
    onSimularSubida(tipo)
  }

  if (!cliente) {
    return (
      <main className="zona">
        <div className="zona__vacio">
          Selecciona un cliente en la barra lateral para empezar.
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
        {/* Zona de arrastrar o subir documentos */}
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
          <p className="zona-subida__sub">Excel, PDF o imágenes · se procesan automáticamente</p>

          {/* Botones de prueba para simular subidas (FASE 1, sin backend) */}
          <div className="zona-subida__botones">
            <button type="button" className="zona-subida__btn" onClick={() => onSimularSubida('excel')}>
              Simular subida de Excel
            </button>
            <button type="button" className="zona-subida__btn" onClick={() => onSimularSubida('pdf')}>
              Simular subida de PDF
            </button>
            <button type="button" className="zona-subida__btn" onClick={() => onSimularSubida('imagen')}>
              Simular subida de imagen
            </button>
          </div>
        </div>

        {/* Lista de documentos procesados hoy */}
        <section className="zona__seccion">
          <h3 className="zona__titulo">
            Documentos procesados hoy
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

        {/* Checklist del cliente activo */}
        <Checklist items={cliente.checklist} />
      </div>
    </main>
  )
}
