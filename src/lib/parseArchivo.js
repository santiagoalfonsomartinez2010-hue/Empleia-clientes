import * as XLSX from 'xlsx'

/*
  Utilidades para preparar un archivo subido antes de mandarlo a analizar:
   - Excel/CSV: se parsean a JSON (texto) con la librería "xlsx".
   - PDF/imágenes: se convierten a base64 para enviarlos a la API de Anthropic.
*/

// Determina el tipo de archivo a partir de su extensión
export function inferirTipoArchivo(nombre) {
  const n = String(nombre || '').toLowerCase()
  if (n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.csv')) return 'excel'
  if (n.endsWith('.pdf')) return 'pdf'
  return 'imagen'
}

// Tipo MIME aproximado según la extensión (para el bloque base64 de la API)
function mediaTypePorNombre(nombre) {
  const n = String(nombre || '').toLowerCase()
  if (n.endsWith('.pdf')) return 'application/pdf'
  if (n.endsWith('.png')) return 'image/png'
  if (n.endsWith('.webp')) return 'image/webp'
  if (n.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg' // por defecto para .jpg/.jpeg y otras imágenes
}

// Parsea un Excel/CSV a texto JSON (todas las hojas) para mandarlo al modelo
export async function parsearExcel(file) {
  const buffer = await file.arrayBuffer()
  const libro = XLSX.read(new Uint8Array(buffer), { type: 'array' })

  const hojas = {}
  for (const nombreHoja of libro.SheetNames) {
    const hoja = libro.Sheets[nombreHoja]
    // defval: '' para que las celdas vacías no se omitan
    hojas[nombreHoja] = XLSX.utils.sheet_to_json(hoja, { defval: '' })
  }

  // Limitamos el tamaño para no exceder el contexto del modelo
  const texto = JSON.stringify(hojas)
  return texto.length > 60000 ? texto.slice(0, 60000) + '…(truncado)' : texto
}

// Convierte un archivo (PDF/imagen) a base64 sin el prefijo data:
export async function archivoABase64(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Conversión binaria a base64 por bloques (evita desbordar la pila)
  let binario = ''
  const tam = 0x8000
  for (let i = 0; i < bytes.length; i += tam) {
    binario += String.fromCharCode.apply(null, bytes.subarray(i, i + tam))
  }
  return {
    base64: btoa(binario),
    mediaType: mediaTypePorNombre(file.name),
  }
}
