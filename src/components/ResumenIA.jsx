import { IconoChispa, IconoAlerta } from './Iconos'
import './ResumenIA.css'

/*
  Resumen inteligente: una segunda llamada a Gemini cruza todas las fuentes
  del panel y devuelve titular, observaciones y acciones recomendadas.
*/
export default function ResumenIA({ resumen, generando, aviso, hayFuentes, onGenerar }) {
  return (
    <div className="resumen">
      <div className="resumen-cabecera">
        <h3>
          <span className="resumen-icono">
            <IconoChispa tam={15} />
          </span>
          Resumen inteligente
        </h3>
        {hayFuentes && (
          <button className="boton-secundario" type="button" onClick={onGenerar} disabled={generando}>
            {generando ? 'Analizando tus fuentes…' : resumen ? 'Regenerar' : 'Generar con IA'}
          </button>
        )}
      </div>

      {aviso && (
        <p className="resumen-aviso">
          <IconoAlerta tam={15} /> {aviso}
        </p>
      )}

      {!resumen && !generando && (
        <p className="resumen-vacio">
          {hayFuentes
            ? 'Pide a la IA que cruce todas tus fuentes: te dirá qué destaca y qué conviene hacer.'
            : 'Cuando conectes fuentes, la IA podrá cruzarlas y resumirte el estado de tu negocio.'}
        </p>
      )}

      {generando && <p className="resumen-vacio">⏳ Cruzando los datos de todas tus fuentes…</p>}

      {resumen && !generando && (
        <>
          <p className="resumen-titular">{resumen.titular}</p>
          <div className="resumen-columnas">
            <div>
              <h4>Qué destaca</h4>
              <ul>
                {resumen.insights.map((texto, i) => (
                  <li key={i}>{texto}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Qué hacer ahora</h4>
              <ul className="resumen-acciones">
                {resumen.sugerencias.map((texto, i) => (
                  <li key={i}>{texto}</li>
                ))}
              </ul>
            </div>
          </div>
          {resumen.esEjemplo && (
            <p className="resumen-nota">Resumen de ejemplo — regenera con tu API key para usar tus datos.</p>
          )}
        </>
      )}
    </div>
  )
}
