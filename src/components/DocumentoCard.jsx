import './DocumentoCard.css'
import Badge from './Badge'
import TablaPrevisualizacion from './TablaPrevisualizacion'
import { IconoTipoDocumento, IconoChevron } from './Iconos'

/*
  Card de un documento. Muestra nombre, icono según tipo de archivo
  (Excel/PDF/imagen), estado (✅ Procesado / ⏳ Procesando / ⚠️ Error) y qué
  detectó. Al hacer click se EXPANDE:
   - Documento recién analizado: tabla de previsualización con confirmar/editar.
   - Documento histórico (ya insertado): solo una nota informativa.
  Un documento "procesando" o con "error" no se puede expandir.
*/
export default function DocumentoCard({ documento, expandido, onToggle, onConfirmar, onEditar }) {
  const procesando = documento.estado === 'procesando'
  const conError = documento.estado === 'error'
  const expandible = !procesando && !conError

  return (
    <div className={`doc-card ${expandido ? 'doc-card--abierta' : ''} ${conError ? 'doc-card--error' : ''}`}>
      {/* Cabecera clicable */}
      <button
        type="button"
        className="doc-card__cabecera"
        onClick={() => expandible && onToggle(documento.id)}
        disabled={!expandible}
      >
        <span className={`doc-card__icono doc-card__icono--${documento.tipo}`}>
          <IconoTipoDocumento tipo={documento.tipo} />
        </span>

        <span className="doc-card__info">
          <span className="doc-card__nombre">{documento.nombre}</span>
          <span className="doc-card__deteccion">{documento.deteccion}</span>
        </span>

        {/* Badge de estado */}
        {procesando && (
          <Badge variante="amarillo" pulso>
            ⏳ Procesando
          </Badge>
        )}
        {conError && <Badge variante="amarillo">⚠️ Error</Badge>}
        {expandible && <Badge variante="verde">✅ Procesado</Badge>}

        {/* Chevron solo cuando se puede expandir */}
        {expandible && (
          <span className="doc-card__chevron">
            <IconoChevron abierto={expandido} />
          </span>
        )}
      </button>

      {/* Contenido expandido */}
      {expandido && expandible && (
        <div className="doc-card__cuerpo">
          {documento.historico ? (
            // Documento ya insertado: no se vuelve a confirmar
            <p className="doc-card__nota">
              Estos datos ya se insertaron en el sistema.
            </p>
          ) : (
            <TablaPrevisualizacion
              documento={documento}
              onConfirmar={onConfirmar}
              onEditar={onEditar}
            />
          )}
        </div>
      )}
    </div>
  )
}
