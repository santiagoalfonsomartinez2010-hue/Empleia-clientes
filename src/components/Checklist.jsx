import './Checklist.css'

/*
  Checklist del cliente activo. Muestra cada tarea de migración con su
  estado (✅ completo / ⏳ pendiente) y el número de registros migrados.
  Arriba, una barra de progreso visual calculada a partir de las tareas
  completadas.
*/
export default function Checklist({ items }) {
  const completas = items.filter((i) => i.completo).length
  const total = items.length
  const porcentaje = total > 0 ? Math.round((completas / total) * 100) : 0

  return (
    <section className="checklist">
      <div className="checklist__cabecera">
        <h3 className="checklist__titulo">Checklist del cliente activo</h3>
        <span className="checklist__contador">
          {completas}/{total} completadas
        </span>
      </div>

      {/* Barra de progreso visual */}
      <div className="checklist__barra">
        <div className="checklist__barra-relleno" style={{ width: `${porcentaje}%` }} />
      </div>

      <ul className="checklist__lista">
        {items.map((item) => (
          <li key={item.id} className={`checklist__item ${item.completo ? '' : 'checklist__item--pendiente'}`}>
            <span className="checklist__icono">{item.completo ? '✅' : '⏳'}</span>
            <span className="checklist__etiqueta">{item.etiqueta}</span>
            <span className="checklist__meta">
              {item.completo
                ? `${item.registros} registro${item.registros === 1 ? '' : 's'}`
                : 'pendiente'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
