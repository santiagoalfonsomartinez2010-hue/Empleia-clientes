import { parsearExcel, archivoABase64 } from './parseArchivo'

/*
  Llamada a la API de Anthropic para analizar un documento subido y extraer
  los datos estructurados que contiene (proveedores, empleados o FAQs).

  ⚠️ SEGURIDAD: al no haber backend, la API key viaja al navegador. Es necesario
  el header `anthropic-dangerous-direct-browser-access` para permitir la llamada
  directa desde el navegador. En producción esto debería ir en un backend.
*/

const MODELO = 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'

// Instrucción para el modelo: qué buscar y en qué formato devolverlo
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
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'Falta VITE_ANTHROPIC_API_KEY en el .env. Añade tu key de Anthropic para analizar documentos.'
    )
  }

  // Construimos el contenido del mensaje según el tipo de archivo
  let contenido
  if (tipoArchivo === 'excel') {
    // Excel/CSV: lo parseamos a texto JSON y lo mandamos como texto
    const textoTabla = await parsearExcel(file)
    contenido = [
      { type: 'text', text: INSTRUCCION },
      {
        type: 'text',
        text: `Contenido del archivo "${file.name}" (en JSON por hojas):\n${textoTabla}`,
      },
    ]
  } else if (tipoArchivo === 'pdf') {
    // PDF: se manda como documento base64
    const { base64 } = await archivoABase64(file)
    contenido = [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      },
      { type: 'text', text: INSTRUCCION },
    ]
  } else {
    // Imagen: se manda como imagen base64 (el modelo la lee por visión/OCR)
    const { base64, mediaType } = await archivoABase64(file)
    contenido = [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      },
      { type: 'text', text: INSTRUCCION },
    ]
  }

  // Llamada a la API. Envuelta para que el llamador maneje los errores con try/catch.
  const respuesta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 4096,
      messages: [{ role: 'user', content: contenido }],
    }),
  })

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`Error de la API de Anthropic (${respuesta.status}): ${detalle}`)
  }

  const datos = await respuesta.json()
  // El texto de la respuesta está en el primer bloque de tipo "text"
  const bloqueTexto = (datos.content || []).find((b) => b.type === 'text')
  if (!bloqueTexto) {
    throw new Error('La respuesta del modelo no contiene texto')
  }

  const resultado = extraerJson(bloqueTexto.text)
  if (!resultado.tipo || !Array.isArray(resultado.registros)) {
    throw new Error('El JSON devuelto no tiene la estructura esperada')
  }
  return resultado
}
