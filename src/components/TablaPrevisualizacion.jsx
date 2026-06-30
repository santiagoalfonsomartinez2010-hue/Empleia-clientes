import './TablaPrevisualizacion.css'

/*
  Tabla de previsualización de los datos extraídos de un documento.
  Las filas marcadas como `duplicado` muestran un aviso ⚠️ indicando
  que se detectó un duplicado y se unificó automáticamente.
  Incluye los botones de confirmar/insertar y editar.
*/
export default function TablaPrevisualizacion({ documento, onConfirmar, onEditar }) {
  const { columnas, filas } = documento

  return (
    <div className="tabla-prev">
      <div className="tabla-prev__scroll">
        <table className="tabla-prev__tabla">
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i} className={fila.duplicado ? 'tabla-prev__fila--dup' : ''}>
                <td>
                  <span className="tabla-prev__nombre">{fila.nombre}</span>
                  {/* Aviso de duplicado detectado y unificado */}
                  {fila.duplicado && (
                    <span className="tabla-prev__aviso">
                      ⚠️ Duplicado detectado y unificado
                    </span>
                  )}
                </td>
                <td className="tabla-prev__suave">{fila.email}</td>
                <td>
                  <span className="tabla-prev__categoria">{fila.categoria}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Acciones sobre los datos previsualizados */}
      <div className="tabla-prev__acciones">
        <button
          type="button"
          className="btn btn--confirmar"
          onClick={() => onConfirmar(documento)}
        >
          ✅ Confirmar e insertar
        </button>
        <button
          type="button"
          className="btn btn--editar"
          onClick={() => onEditar(documento)}
        >
          ✏️ Editar
        </button>
      </div>
    </div>
  )
}
