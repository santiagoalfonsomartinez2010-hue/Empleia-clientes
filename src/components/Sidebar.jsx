import {
  IconoPanel,
  IconoMas,
  IconoChispa,
  IconoPapelera,
  IconoLlave,
  IconoTipoArchivo,
} from './Iconos'
import { colorCliente } from '../lib/visuales'
import './Sidebar.css'

/*
  Columna izquierda (estilo panel de Lovable): logo y espacio de trabajo,
  acciones principales, lista de fuentes conectadas y estado de la API key.
*/
export default function Sidebar({ fuentes, hayApiKey, onAnadir, onEjemplo, onVaciar, onApiKey }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-cuadro">E</span>
        <div>
          <strong>Empleia</strong>
          <span className="sidebar-logo-sub">Panel Unificado</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button className="sidebar-item activo" type="button">
          <IconoPanel /> Panel
        </button>
        <button className="sidebar-item" type="button" onClick={onAnadir}>
          <IconoMas /> Añadir datos
        </button>
        <button className="sidebar-item" type="button" onClick={onEjemplo}>
          <IconoChispa /> Datos de ejemplo
        </button>
        {fuentes.length > 0 && (
          <button className="sidebar-item peligro" type="button" onClick={onVaciar}>
            <IconoPapelera /> Vaciar panel
          </button>
        )}
      </nav>

      <div className="sidebar-seccion">Fuentes conectadas</div>
      <div className="sidebar-fuentes">
        {fuentes.length === 0 && (
          <p className="sidebar-vacio">
            Aún no hay fuentes. Sube un Excel, un PDF, una imagen o un calendario.
          </p>
        )}
        {fuentes.map((f) => (
          <div className="sidebar-fuente" key={f.id} title={f.nombreArchivo}>
            <span
              className="sidebar-fuente-icono"
              style={{ color: colorCliente(f.nombreArchivo) }}
            >
              <IconoTipoArchivo tipo={f.tipoArchivo} tam={16} />
            </span>
            <span className="sidebar-fuente-nombre">
              {f.resultado?.titulo || f.nombreArchivo}
            </span>
            <span className={`sidebar-fuente-punto ${f.estado}`} title={f.estado} />
          </div>
        ))}
      </div>

      <button className="sidebar-apikey" type="button" onClick={onApiKey}>
        <span className="sidebar-apikey-icono">
          <IconoLlave tam={16} />
        </span>
        <span className="sidebar-apikey-texto">
          <strong>API key de Gemini</strong>
          <span className={hayApiKey ? 'ok' : 'falta'}>
            {hayApiKey ? 'Configurada' : 'Sin configurar'}
          </span>
        </span>
      </button>
    </aside>
  )
}
