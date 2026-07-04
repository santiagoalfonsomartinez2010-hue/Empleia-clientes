import './Graficos.css'

/*
  Barras horizontales de registros por fuente. Una sola serie (magnitud), así
  que se usa un único tono —el violeta de marca— con el valor etiquetado al
  final de cada barra; el color no codifica nada más.
*/
export default function GraficoFuentes({ datos }) {
  if (datos.length === 0) {
    return <p className="grafico-vacio">Sin registros todavía.</p>
  }

  const maximo = Math.max(...datos.map((d) => d.valor), 1)

  return (
    <div className="grafico-barras">
      {datos.map((d) => (
        <div
          className="grafico-fila"
          key={d.id}
          title={`${d.nombre}: ${d.valor} ${d.valor === 1 ? 'registro' : 'registros'}`}
        >
          <span className="grafico-nombre">{d.nombre}</span>
          <div className="grafico-pista">
            <div
              className="grafico-barra"
              style={{ width: `${Math.max((d.valor / maximo) * 100, 2)}%` }}
            />
            <span className="grafico-valor">{d.valor}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
