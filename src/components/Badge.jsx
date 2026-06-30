import './Badge.css'

/*
  Badge de estado reutilizable, idéntico al patrón usado por el resto
  de empleados de Empleia. Variantes de color:
   - 'verde'   → éxito / procesado / completo
   - 'amarillo'→ pendiente / en proceso / advertencia
   - 'violeta' → informativo / activo
   - 'neutro'  → metadatos
  La prop `pulso` añade una animación sutil para estados "en curso".
*/
export default function Badge({ variante = 'neutro', children, pulso = false }) {
  return (
    <span className={`badge badge--${variante} ${pulso ? 'badge--pulso' : ''}`}>
      {children}
    </span>
  )
}
