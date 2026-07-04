/*
  Categorías fijas del panel y su color asignado.

  El color sigue SIEMPRE a la categoría (nunca a su posición o tamaño en el
  gráfico): si se filtran fuentes, cada categoría conserva su color. La paleta
  está validada para daltonismo y contraste ≥3:1 sobre el fondo de las cards
  (#0f1117); como la separación de pares adyacentes queda en la banda mínima,
  los gráficos que la usan llevan siempre etiquetas directas con el valor.
*/

export const INFO_CATEGORIAS = {
  finanzas: { etiqueta: 'Finanzas', color: '#3987e5' },
  personas: { etiqueta: 'Personas', color: '#199e70' },
  clientes: { etiqueta: 'Clientes', color: '#c98500' },
  inventario: { etiqueta: 'Inventario', color: '#008300' },
  agenda: { etiqueta: 'Agenda', color: '#9085e9' },
  operaciones: { etiqueta: 'Operaciones', color: '#e66767' },
  otros: { etiqueta: 'Otros', color: '#6b7185' },
}

export function infoCategoria(clave) {
  return INFO_CATEGORIAS[clave] || INFO_CATEGORIAS.otros
}
