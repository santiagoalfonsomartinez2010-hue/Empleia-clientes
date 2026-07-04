import { useState } from 'react'
import { IconoMas, IconoChispa, IconoSubir } from './Iconos'
import './Hero.css'

/*
  Cabecera con degradado (referencia visual: panel de Lovable) y la zona de
  subida de archivos, que funciona por clic o arrastrando encima.
*/
export default function Hero({ hayFuentes, onArchivosSoltados, onPedirArchivos, onEjemplo }) {
  const [arrastrando, setArrastrando] = useState(false)

  function alSoltar(e) {
    e.preventDefault()
    setArrastrando(false)
    onArchivosSoltados(e.dataTransfer?.files)
  }

  return (
    <header className="hero">
      <div className="hero-contenido">
        <h1>Todos tus datos, un solo panel</h1>
        <p className="hero-sub">
          Sube tus Excels, PDFs, imágenes y calendarios sueltos. La IA de Empleia los entiende,
          los cruza y los convierte en un dashboard organizado.
        </p>

        <div
          className={`hero-dropzone ${arrastrando ? 'arrastrando' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setArrastrando(true)
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={alSoltar}
          onClick={onPedirArchivos}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onPedirArchivos()
          }}
        >
          <span className="hero-dropzone-icono">
            <IconoSubir tam={22} />
          </span>
          <div className="hero-dropzone-texto">
            <strong>Arrastra tus archivos aquí</strong>
            <span>Excel · CSV · PDF · imágenes · calendarios (.ics) · JSON</span>
          </div>
          <span className="hero-dropzone-boton">
            <IconoMas tam={16} /> Añadir archivos
          </span>
        </div>

        {!hayFuentes && (
          <button
            className="hero-ejemplo"
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEjemplo()
            }}
          >
            <IconoChispa tam={15} /> ¿Sin archivos a mano? Prueba con datos de ejemplo
          </button>
        )}
      </div>
    </header>
  )
}
