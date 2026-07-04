import * as XLSX from 'xlsx'

/*
  Utilidades para preparar un archivo subido antes de mandarlo a analizar:
   - Excel/CSV: se parsean a JSON (texto) con la librería "xlsx".
   - Calendarios (.ics), JSON y texto plano: se leen como texto.
   - PDF/imágenes: se convierten a base64 para enviarlos a la API de Gemini.
*/

// Determina el tipo de archivo a partir de su extensión
export function inferirTipoArchivo(nombre) {
  const n = String(nombre || '').toLowerCase()
  if (n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.csv')) return 'excel'
  if (n.endsWith('.pdf')) return 'pdf'
  if (n.endsWith('.ics')) return 'calendario'
  if (n.endsWith('.json') || n.endsWith('.txt') || n.endsWith('.md')) return 'texto'
  return 'imagen'
}

// Etiqueta legible del tipo (para mostrar en la interfaz)
export function etiquetaTipoArchivo(tipo) {
  return (
    {
      excel: 'Hoja de cálculo',
      pdf: 'PDF',
      calendario: 'Calendario',
      texto: 'Texto / JSON',
      imagen: 'Imagen',
    }[tipo] || 'Archivo'
  )
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

// Limita un texto largo para no exceder el contexto del modelo
function limitar(texto, max = 60000) {
  return texto.length > max ? texto.slice(0, max) + '…(truncado)' : texto
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
  return limitar(JSON.stringify(hojas))
}

// Lee un archivo de texto plano (.ics, .json, .txt) limitado en tamaño
export async function leerTexto(file) {
  const texto = await file.text()
  return limitar(texto)
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
