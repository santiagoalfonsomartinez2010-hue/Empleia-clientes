import { supabase } from '../supabaseClient'
import { configDeTipo } from '../lib/tiposDeteccion'

/*
  Capa de acceso a datos del empleado de Onboarding. Centraliza todas las
  consultas a Supabase. Cada función maneja errores y los propaga para que la
  UI pueda mostrarlos (la app envuelve las llamadas en try/catch).
*/

// --- Clientes -------------------------------------------------------------

// Lista todos los clientes de la empresa, ordenados por fecha de alta descendente
export async function listarClientes() {
  const { data, error } = await supabase
    .from('clientes_empresa')
    .select('id, nombre, sector, ciudad, fecha_alta, estado_onboarding, porcentaje_completado')
    .order('fecha_alta', { ascending: false })

  if (error) throw error
  return data || []
}

// Crea un cliente nuevo y devuelve la fila insertada
export async function crearCliente({ nombre, sector, ciudad }) {
  const { data, error } = await supabase
    .from('clientes_empresa')
    .insert({
      nombre,
      sector,
      ciudad,
      estado_onboarding: 'en_proceso',
      porcentaje_completado: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Actualiza el porcentaje de completado de un cliente
export async function actualizarPorcentaje(clienteId, porcentaje) {
  const { error } = await supabase
    .from('clientes_empresa')
    .update({ porcentaje_completado: porcentaje })
    .eq('id', clienteId)

  if (error) throw error
}

// --- Documentos procesados ------------------------------------------------

// Lista los documentos procesados de un cliente (más recientes primero)
export async function listarDocumentos(clienteId) {
  const { data, error } = await supabase
    .from('documentos_procesados')
    .select('id, nombre_archivo, tipo_detectado, registros_extraidos, estado, duplicados_detectados, fecha_subida')
    .eq('cliente_id', clienteId)
    .order('fecha_subida', { ascending: false })

  if (error) throw error
  return data || []
}

// Inserta el registro resumen de un documento procesado
export async function registrarDocumento({
  clienteId,
  nombreArchivo,
  tipoDetectado,
  registrosExtraidos,
  duplicadosDetectados,
}) {
  const { error } = await supabase.from('documentos_procesados').insert({
    cliente_id: clienteId,
    nombre_archivo: nombreArchivo,
    tipo_detectado: tipoDetectado,
    registros_extraidos: registrosExtraidos,
    estado: 'procesado',
    duplicados_detectados: duplicadosDetectados,
  })

  if (error) throw error
}

// --- Detección de duplicados y conteos ------------------------------------

// Devuelve los valores existentes del campo clave de un tipo para un cliente
// (sirve para detectar duplicados antes de insertar)
export async function obtenerValoresExistentes(tipo, clienteId) {
  const config = configDeTipo(tipo)
  if (!config) return []

  const { data, error } = await supabase
    .from(config.tabla)
    .select(config.campoClave)
    .eq('cliente_id', clienteId)

  if (error) throw error
  return (data || []).map((fila) => fila[config.campoClave])
}

// Cuenta cuántas filas tiene una tabla para un cliente (sin traer los datos)
async function contarFilas(tabla, clienteId) {
  const { count, error } = await supabase
    .from(tabla)
    .select('id', { count: 'exact', head: true })
    .eq('cliente_id', clienteId)

  if (error) throw error
  return count || 0
}

// --- Inserción real al confirmar ------------------------------------------

// Inserta los registros (ya filtrados de duplicados) en la tabla correspondiente
export async function insertarRegistros(tipo, clienteId, filas) {
  const config = configDeTipo(tipo)
  if (!config) throw new Error(`Tipo de datos no soportado: ${tipo}`)

  // Solo guardamos los campos definidos para la tabla + el cliente_id
  const registros = filas.map((fila) => {
    const fila_limpia = { cliente_id: clienteId }
    for (const campo of config.camposInsert) {
      // Las cadenas vacías se guardan como null para no ensuciar la BD
      const valor = fila[campo]
      fila_limpia[campo] = valor === '' || valor === undefined ? null : valor
    }
    return fila_limpia
  })

  const { error } = await supabase.from(config.tabla).insert(registros)
  if (error) throw error
  return registros.length
}

// --- Checklist con datos reales -------------------------------------------

/*
  Construye el checklist del cliente contando filas reales en cada tabla.
  Devuelve también el porcentaje de completado calculado a partir del checklist.
*/
export async function construirChecklist(clienteId) {
  // Conteos reales en paralelo
  const [proveedores, empleados, faqs, catalogo] = await Promise.all([
    contarFilas('proveedores', clienteId),
    contarFilas('empleados', clienteId),
    contarFilas('faqs', clienteId),
    contarFilas('productos_servicios', clienteId),
  ])

  const items = [
    { id: 'proveedores', etiqueta: 'Proveedores', registros: proveedores, completo: proveedores > 0 },
    { id: 'equipo', etiqueta: 'Equipo', registros: empleados, completo: empleados > 0 },
    { id: 'faqs', etiqueta: 'FAQs', registros: faqs, completo: faqs > 0 },
    { id: 'catalogo', etiqueta: 'Catálogo de servicios', registros: catalogo, completo: catalogo > 0 },
    // "Conectar Gmail" no es detectable automáticamente: queda pendiente
    { id: 'gmail', etiqueta: 'Conectar Gmail', registros: 0, completo: false },
  ]

  const completos = items.filter((i) => i.completo).length
  const porcentaje = Math.round((completos / items.length) * 100)

  return { items, porcentaje }
}

// --- Total migrado hoy (sidebar) ------------------------------------------

// Suma los registros extraídos de los documentos procesados hoy (todos los clientes)
export async function contarMigradoHoy() {
  const inicioDia = new Date()
  inicioDia.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('documentos_procesados')
    .select('registros_extraidos, fecha_subida')
    .gte('fecha_subida', inicioDia.toISOString())

  if (error) throw error
  return (data || []).reduce((suma, doc) => suma + (doc.registros_extraidos || 0), 0)
}
