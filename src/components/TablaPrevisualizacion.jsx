import './TablaPrevisualizacion.css'

/*
  Tabla de previsualización de los datos extraídos de un documento.
  Las columnas son dinámicas según el tipo detectado (proveedores, empleados o
  FAQs): documento.columnas = [{ clave, etiqueta }, ...].
  Las filas marcadas como duplicadas (`__duplicado`) muestran un aviso ⚠️.
*/
export default function TablaPrevisualizacion({ documento, onConfirmar, onEditar }) {
  const { columnas, filas } = documento
  const duplicados = filas.filter((f) => f.__duplicado).length
  const aInsertar = filas.length - duplicados

  return (
    <div className="tabla-prev">
      <div className="tabla-prev__scroll">
        <table className="tabla-prev__tabla">
          <thead>
            <tr>
              {columnas.map((col) => (
                <th key={col.clave}>{col.etiqueta}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={i} className={fila.__duplicado ? 'tabla-prev__fila--dup' : ''}>
                {columnas.map((col, j) => (
                  <td key={col.clave} className={j === 0 ? '' : 'tabla-prev__suave'}>
                    {j === 0 ? (
                      <>
                        {/* La primera columna lleva el valor "principal" + aviso de duplicado */}
                        <span className="tabla-prev__nombre">{fila[col.clave] || '—'}</span>
                        {fila.__duplicado && (
                          <span className="tabla-prev__aviso">
                            ⚠️ Duplicado detectado y unificado
                          </span>
                        )}
                      </>
                    ) : (
                      fila[col.clave] || '—'
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen + acciones */}
      <p className="tabla-prev__resumen">
        Se insertarán <strong>{aInsertar}</strong> registro(s)
        {duplicados > 0 && ` · ${duplicados} duplicado(s) se omitirán`}.
      </p>
      <div className="tabla-prev__acciones">
        <button
          type="button"
          className="btn btn--confirmar"
          onClick={() => onConfirmar(documento)}
        >
          ✅ Confirmar e insertar
        </button>
        <button type="button" className="btn btn--editar" onClick={() => onEditar(documento)}>
          ✏️ Editar
        </button>
      </div>
    </div>
  )
}
