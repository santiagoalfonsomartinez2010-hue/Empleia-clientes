import './Kpis.css'

/*
  Fila de cifras clave (stat tiles): valor grande + etiqueta. Sin gráfico:
  para un puñado de números sueltos la forma correcta es la ficha, no barras.
*/
export default function Kpis({ numFuentes, totalRegistros, numEventos, numCategorias }) {
  const kpis = [
    { etiqueta: 'Fuentes conectadas', valor: numFuentes },
    { etiqueta: 'Registros organizados', valor: totalRegistros },
    { etiqueta: 'Próximos eventos', valor: numEventos },
    { etiqueta: 'Categorías de datos', valor: numCategorias },
  ]

  return (
    <div className="kpis">
      {kpis.map((k) => (
        <div className="kpi" key={k.etiqueta}>
          <span className="kpi-valor">{k.valor}</span>
          <span className="kpi-etiqueta">{k.etiqueta}</span>
        </div>
      ))}
    </div>
  )
}
