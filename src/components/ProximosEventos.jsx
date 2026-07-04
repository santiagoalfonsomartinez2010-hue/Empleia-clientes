import './ProximosEventos.css'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Días que faltan hasta una fecha AAAA-MM-DD (0 = hoy)
function diasHasta(fecha) {
  const objetivo = new Date(`${fecha}T00:00:00`)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Math.round((objetivo - hoy) / 86400000)
}

/*
  Agenda unificada: los eventos de TODAS las fuentes (vencimientos de
  facturas, citas del calendario, fin de contratos…) en una sola lista
  ordenada por fecha. Los que caen en la próxima semana se marcan.
*/
export default function ProximosEventos({ eventos }) {
  if (eventos.length === 0) {
    return <p className="eventos-vacio">No hay eventos futuros en tus fuentes.</p>
  }

  return (
    <ul className="eventos">
      {eventos.slice(0, 8).map((e, i) => {
        const [, mes, dia] = e.fecha.split('-')
        const dias = diasHasta(e.fecha)
        return (
          <li className="evento" key={`${e.fecha}-${i}`}>
            <span className={`evento-fecha ${dias <= 7 ? 'pronto' : ''}`}>
              <b>{Number(dia)}</b>
              {MESES[Number(mes) - 1] || mes}
            </span>
            <span className="evento-cuerpo">
              <span className="evento-titulo">{e.titulo}</span>
              <span className="evento-meta">
                {dias === 0 ? 'Hoy' : dias === 1 ? 'Mañana' : `En ${dias} días`} · {e.fuente}
              </span>
            </span>
          </li>
        )
      })}
      {eventos.length > 8 && <li className="eventos-mas">+{eventos.length - 8} eventos más</li>}
    </ul>
  )
}
