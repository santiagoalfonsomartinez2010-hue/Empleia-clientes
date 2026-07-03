import { parsearExcel, archivoABase64 } from './parseArchivo'

/*
  Llamada a la API de Google Gemini para analizar un documento subido y extraer
  los datos estructurados que contiene (proveedores, empleados o FAQs).

  ⚠️ SEGURIDAD: al no haber backend, la API key viaja al navegador (va como
  parámetro ?key= en la URL). Úsala solo en esta herramienta interna; en
  producción la llamada debería ir en un backend.
*/

// Modelo de Gemini. Los modelos 1.5 fueron retirados de la API pública, así que
// usamos un modelo 2.x actual por defecto. Se puede sobrescribir con la variable
// de entorno VITE_GEMINI_MODEL sin tocar el código.
const MODELO = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite').trim()
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`

// Instrucción para el modelo (se envía como system_instruction en Gemini):
// qué buscar y en qué formato devolverlo. Igual que antes.
const INSTRUCCION = `Analiza este documento y determina si contiene datos de proveedores, empleados o FAQs.
Devuelve SOLO un JSON válido (sin texto adicional, sin markdown) con esta estructura exacta:
{ "tipo": "proveedores" | "empleados" | "faqs", "registros": [ ... ] }

Según el tipo, cada objeto de "registros" debe tener estos campos (usa cadena vacía si falta el dato):
- proveedores: { "nombre", "email", "telefono", "categoria", "iban", "notas" }
- empleados: { "nombre", "cargo", "tipo_contrato", "fecha_inicio", "fecha_vencimiento_contrato", "estado", "obra_asignada" }
- faqs: { "pregunta", "respuesta", "categoria" }

Las fechas en formato AAAA-MM-DD. No inventes datos que no estén en el documento.`

// Extrae el primer objeto JSON que aparezca en un texto (por si el modelo añade prosa)
function extraerJson(texto) {
  const inicio = texto.indexOf('{')
  const fin = texto.lastIndexOf('}')
  if (inicio === -1 || fin === -1) {
    throw new Error('La respuesta del modelo no contiene un JSON válido')
  }
  return JSON.parse(texto.slice(inicio, fin + 1))
}

/*
  Analiza un archivo y devuelve { tipo, registros }.
  - tipoArchivo: 'excel' | 'pdf' | 'imagen' (decide cómo preparar el contenido).
*/
export async function analizarDocumento(file, tipoArchivo) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'Falta VITE_GEMINI_API_KEY en el .env. Añade tu key de Google Gemini para analizar documentos.'
    )
  }

  // Construimos las "parts" del mensaje del usuario según el tipo de archivo.
  // En Gemini, cada archivo (PDF/imagen) va como inline_data { mime_type, data }.
  let partes
  if (tipoArchivo === 'excel') {
    // Excel/CSV: lo parseamos a texto JSON y lo mandamos como texto
    const textoTabla = await parsearExcel(file)
    partes = [
      { text: `Contenido del archivo "${file.name}" (en JSON por hojas):\n${textoTabla}` },
    ]
  } else if (tipoArchivo === 'pdf') {
    // PDF: se manda como dato en línea base64
    const { base64 } = await archivoABase64(file)
    partes = [
      { inline_data: { mime_type: 'application/pdf', data: base64 } },
      { text: `Analiza este documento "${file.name}".` },
    ]
  } else {
    // Imagen: se manda como imagen en línea base64 (el modelo la lee por visión/OCR)
    const { base64, mediaType } = await archivoABase64(file)
    partes = [
      { inline_data: { mime_type: mediaType, data: base64 } },
      { text: `Analiza esta imagen "${file.name}".` },
    ]
  }

  // Cuerpo en formato Gemini: system_instruction + contents con role "user".
  const cuerpo = {
    system_instruction: { parts: [{ text: INSTRUCCION }] },
    contents: [{ role: 'user', parts: partes }],
    generationConfig: { maxOutputTokens: 4096 },
  }

  // Llamada a la API. La autenticación va como ?key= en la URL (no en cabeceras).
  // Envuelta para que el llamador maneje los errores con try/catch.
  const respuesta = await fetch(`${API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`Error de la API de Gemini (${respuesta.status}): ${detalle}`)
  }

  const datos = await respuesta.json()
  // El texto de la respuesta está en candidates[0].content.parts[0].text
  const texto = datos?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!texto) {
    throw new Error('La respuesta del modelo no contiene texto')
  }

  const resultado = extraerJson(texto)
  if (!resultado.tipo || !Array.isArray(resultado.registros)) {
    throw new Error('El JSON devuelto no tiene la estructura esperada')
  }
  return resultado
}
