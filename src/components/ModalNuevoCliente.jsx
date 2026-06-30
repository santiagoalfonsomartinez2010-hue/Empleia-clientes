import { useState } from 'react'
import './ModalNuevoCliente.css'

/*
  Formulario simple (en un modal) para dar de alta un cliente nuevo.
  Pide nombre, sector y ciudad y, al guardar, delega en `onCrear` (que inserta
  la fila en Supabase). Muestra estado de "Guardando…" y posibles errores.
*/
export default function ModalNuevoCliente({ onCerrar, onCrear }) {
  const [nombre, setNombre] = useState('')
  const [sector, setSector] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const manejarEnvio = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es obligatorio.')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      await onCrear({ nombre: nombre.trim(), sector: sector.trim(), ciudad: ciudad.trim() })
      // Si todo va bien, el componente padre cierra el modal
    } catch (err) {
      setError(err.message || 'No se pudo crear el cliente.')
      setGuardando(false)
    }
  }

  return (
    <div className="modal__fondo" onClick={onCerrar}>
      {/* stopPropagation: clicar dentro del modal no lo cierra */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__cabecera">
          <h2 className="modal__titulo">Nuevo cliente</h2>
          <button type="button" className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <form className="modal__form" onSubmit={manejarEnvio}>
          <label className="modal__campo">
            <span>Nombre *</span>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Reformas Europa"
              autoFocus
            />
          </label>

          <label className="modal__campo">
            <span>Sector</span>
            <input
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej. Construcción"
            />
          </label>

          <label className="modal__campo">
            <span>Ciudad</span>
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Ej. Madrid"
            />
          </label>

          {error && <p className="modal__error">{error}</p>}

          <div className="modal__acciones">
            <button type="button" className="modal__btn modal__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="modal__btn modal__btn--guardar" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
