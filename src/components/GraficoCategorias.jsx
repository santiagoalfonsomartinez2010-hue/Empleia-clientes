import { INFO_CATEGORIAS } from '../lib/categorias'
import './Graficos.css'

/*
  Parte-del-todo de los registros por categoría: barra apilada horizontal con
  huecos de 2px entre segmentos y leyenda con el valor de cada categoría
  (etiqueta directa: el color nunca es el único canal).
*/
export default function GraficoCategorias({ porCategoria, total }) {
  // Orden fijo por el catálogo de categorías (no por tamaño), para que cada
  // categoría conserve posición y color aunque cambien los datos.
  const segmentos = Object.keys(INFO_CATEGORIAS)
    .filter((clave) => porCategoria[clave] > 0)
    .map((clave) => ({
      clave,
      etiqueta: INFO_CATEGORIAS[clave].etiqueta,
      color: INFO_CATEGORIAS[clave].color,
      valor: porCategoria[clave],
    }))

  if (segmentos.length === 0 || total === 0) {
    return <p className="grafico-vacio">Sin registros todavía.</p>
  }

  return (
    <div>
      <div className="apilada" role="img" aria-label="Reparto de registros por categoría">
        {segmentos.map((s) => (
          <div
            className="apilada-segmento"
            key={s.clave}
            style={{ flexGrow: s.valor, background: s.color }}
            title={`${s.etiqueta}: ${s.valor} registros (${Math.round((s.valor / total) * 100)} %)`}
          />
        ))}
      </div>
      <ul className="apilada-leyenda">
        {segmentos.map((s) => (
          <li key={s.clave}>
            <span className="apilada-chip" style={{ background: s.color }} />
            {s.etiqueta}
            <b>{s.valor}</b>
            <span className="apilada-pct">{Math.round((s.valor / total) * 100)} %</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
