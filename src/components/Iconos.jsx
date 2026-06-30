/*
  Iconos SVG inline reutilizables. Se mantienen como componentes
  pequeños para no depender de librerías externas y poder teñirlos
  con currentColor desde el CSS de cada empleado.
*/

// Icono de subida / clip para la zona de arrastrar archivos
export function IconoSubir({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  )
}

// Icono de hoja de cálculo (Excel)
export function IconoExcel({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 7l6 10M15 7L9 17" />
    </svg>
  )
}

// Icono de documento PDF
export function IconoPdf({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M8 13h2M8 16h6" />
    </svg>
  )
}

// Icono de imagen
export function IconoImagen({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 17l-5-5L6 21" />
    </svg>
  )
}

// Selecciona el icono adecuado según el tipo de documento
export function IconoTipoDocumento({ tipo, size = 20 }) {
  if (tipo === 'excel') return <IconoExcel size={size} />
  if (tipo === 'pdf') return <IconoPdf size={size} />
  return <IconoImagen size={size} />
}

// Flecha (chevron) para indicar card expandible
export function IconoChevron({ size = 18, abierto = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s ease', transform: abierto ? 'rotate(90deg)' : 'none' }}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

// Icono "+" para el botón de nuevo cliente
export function IconoMas({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
