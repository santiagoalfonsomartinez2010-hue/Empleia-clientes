/*
  Helpers visuales para representar a un cliente en la interfaz: iniciales del
  avatar y un color estable derivado de su nombre (para que cada cliente tenga
  siempre el mismo color sin guardarlo en la base de datos).
*/

// Paleta de marca de Empleia para los avatares de cliente
const PALETA = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

// Genera hasta dos iniciales a partir del nombre del cliente
export function generarInicial(nombre) {
  const partes = String(nombre || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (partes.length === 0) return '?'
  const iniciales = partes.slice(0, 2).map((p) => p[0])
  return iniciales.join('').toUpperCase()
}

// Devuelve un color estable de la paleta a partir del texto (hash simple)
export function colorCliente(texto) {
  const cadena = String(texto || '')
  let hash = 0
  for (let i = 0; i < cadena.length; i++) {
    hash = (hash * 31 + cadena.charCodeAt(i)) % 100000
  }
  return PALETA[hash % PALETA.length]
}
