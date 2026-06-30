import './DocumentoCard.css'
import Badge from './Badge'
import TablaPrevisualizacion from './TablaPrevisualizacion'
import { IconoTipoDocumento, IconoChevron } from './Iconos'

/*
  Card de un documento procesado hoy. Muestra nombre, icono según tipo
  (Excel/PDF/imagen), estado (✅ Procesado / ⏳ Procesando) y qué detectó.
  Al hacer click se EXPANDE mostrando la tabla de previsualización con
  los datos extraídos simulados. Un documento "procesando" no se puede
  expandir todavía.
*/
export default function DocumentoCard({ documento, expandido, onToggle, onConfirmar, onEditar }) {
  const procesando = documento.estado === 'procesando'

  return (
    <div className={`doc-card ${expandido ? 'doc-card--abierta' : ''}`}>
      {/* Cabecera clicable */}
      <button
        type="button"
        className="doc-card__cabecera"
        onClick={() => !procesando && onToggle(documento.id)}
        disabled={procesando}
      >
        <span className={`doc-card__icono doc-card__icono--${documento.tipo}`}>
          <IconoTipoDocumento tipo={documento.tipo} />
        </span>

        <span className="doc-card__info">
          <span className="doc-card__nombre">{documento.nombre}</span>
          <span className="doc-card__deteccion">{documento.deteccion}</span>
        </span>

        {/* Badge de estado */}
        {procesando ? (
          <Badge variante="amarillo" pulso>⏳ Procesando</Badge>
        ) : (
          <Badge variante="verde">✅ Procesado</Badge>
        )}

        {/* Chevron solo cuando ya está procesado */}
        {!procesando && (
          <span className="doc-card__chevron">
            <IconoChevron abierto={expandido} />
          </span>
        )}
      </button>

      {/* Contenido expandido: tabla de previsualización */}
      {expandido && !procesando && (
        <div className="doc-card__cuerpo">
          <TablaPrevisualizacion
            documento={documento}
            onConfirmar={onConfirmar}
            onEditar={onEditar}
          />
        </div>
      )}
    </div>
  )
}
