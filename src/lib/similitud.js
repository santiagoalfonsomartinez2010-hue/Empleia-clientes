/*
  Detección de duplicados por similitud de texto simple.
  Reglas (según especificación):
   - Ignorar mayúsculas/minúsculas.
   - Ignorar espacios extra (al inicio, al final y dobles espacios internos).
   - Considerar duplicado si los nombres son iguales o si uno contiene al otro.
*/

// Normaliza un texto: minúsculas, sin acentos y con espacios colapsados
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .replace(/\s+/g, ' ') // colapsa espacios
    .trim()
}

// ¿Son a y b "el mismo" valor por similitud simple?
export function sonSimilares(a, b) {
  const na = normalizar(a)
  const nb = normalizar(b)
  if (!na || !nb) return false
  if (na === nb) return true
  // Uno contiene al otro (evita falsos positivos con cadenas muy cortas)
  if (na.length >= 3 && nb.length >= 3) {
    if (na.includes(nb) || nb.includes(na)) return true
  }
  return false
}

/*
  Marca como duplicadas las filas cuyo valor en `campoClave` es similar a alguno
  de los valores ya existentes en la base de datos. Devuelve una nueva lista de
  filas con la propiedad `__duplicado` (true/false) añadida.
*/
export function marcarDuplicados(filas, valoresExistentes, campoClave) {
  const existentesNorm = (valoresExistentes || []).map(normalizar)
  return filas.map((fila) => {
    const valor = fila[campoClave]
    const esDuplicado = existentesNorm.some((existente) =>
      sonSimilares(valor, existente)
    )
    return { ...fila, __duplicado: esDuplicado }
  })
}
