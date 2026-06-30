import './Sidebar.css'
import { IconoMas } from './Iconos'

/*
  COLUMNA 1 — Sidebar izquierdo (260px).
  Muestra al empleado de Onboarding, la lista de clientes en proceso
  (clicables para seleccionarlos), el botón de nuevo cliente y el
  total de registros migrados hoy (datos reales de Supabase).
*/
export default function Sidebar({
  clientes,
  clienteActivoId,
  cargando,
  totalMigradoHoy,
  onSeleccionarCliente,
  onNuevoCliente,
}) {
  return (
    <aside className="sidebar">
      {/* Cabecera: avatar del empleado con punto verde de "en línea" */}
      <div className="sidebar__empleado">
        <div className="sidebar__avatar-wrap">
          <div className="sidebar__avatar">ON</div>
          <span className="sidebar__estado-punto" title="En línea" />
        </div>
        <div className="sidebar__empleado-info">
          <h1 className="sidebar__nombre">Onboarding</h1>
          <p className="sidebar__rol">Migración de datos de clientes</p>
        </div>
      </div>

      <div className="sidebar__separador" />

      {/* Lista de clientes en proceso */}
      <div className="sidebar__seccion">
        <h2 className="sidebar__titulo">Clientes en proceso</h2>

        {/* Estados de carga / vacío */}
        {cargando && <p className="sidebar__vacio">Cargando clientes…</p>}
        {!cargando && clientes.length === 0 && (
          <p className="sidebar__vacio">No hay clientes todavía.</p>
        )}

        <ul className="sidebar__lista">
          {clientes.map((cliente) => {
            const activo = cliente.id === clienteActivoId
            return (
              <li key={cliente.id}>
                <button
                  type="button"
                  className={`cliente-item ${activo ? 'cliente-item--activo' : ''}`}
                  onClick={() => onSeleccionarCliente(cliente.id)}
                >
                  <span
                    className="cliente-item__avatar"
                    style={{ backgroundColor: cliente.color }}
                  >
                    {cliente.inicial}
                  </span>
                  <span className="cliente-item__texto">
                    <span className="cliente-item__nombre">{cliente.nombre}</span>
                    <span className="cliente-item__progreso">{cliente.progreso}% completo</span>
                  </span>
                  {/* Mini barra de progreso del cliente */}
                  <span className="cliente-item__barra">
                    <span
                      className="cliente-item__barra-relleno"
                      style={{ width: `${cliente.progreso}%` }}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Botón para registrar un nuevo cliente */}
        <button type="button" className="sidebar__nuevo" onClick={onNuevoCliente}>
          <IconoMas size={16} />
          Nuevo cliente
        </button>
      </div>

      {/* Pie del sidebar: total migrado hoy */}
      <div className="sidebar__pie">
        <span className="sidebar__pie-etiqueta">Total migrado hoy</span>
        <span className="sidebar__pie-valor">{totalMigradoHoy} registros</span>
      </div>
    </aside>
  )
}
