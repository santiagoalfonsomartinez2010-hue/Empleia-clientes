/*
  Configuración de los tres tipos de datos que el modelo puede detectar en un
  documento. Para cada tipo se define:
   - tabla:       tabla de Supabase donde se insertan los registros.
   - campoClave:  campo usado para detectar duplicados.
   - columnas:    columnas que se muestran en la tabla de previsualización.
   - camposInsert: campos que realmente se guardan en la base de datos.
*/
export const TIPOS = {
  proveedores: {
    etiqueta: 'proveedores',
    tabla: 'proveedores',
    campoClave: 'nombre',
    columnas: [
      { clave: 'nombre', etiqueta: 'Nombre' },
      { clave: 'email', etiqueta: 'Email' },
      { clave: 'categoria', etiqueta: 'Categoría' },
    ],
    camposInsert: ['nombre', 'email', 'telefono', 'categoria', 'iban', 'notas'],
  },
  empleados: {
    etiqueta: 'empleados',
    tabla: 'empleados',
    campoClave: 'nombre',
    columnas: [
      { clave: 'nombre', etiqueta: 'Nombre' },
      { clave: 'cargo', etiqueta: 'Cargo' },
      { clave: 'estado', etiqueta: 'Estado' },
    ],
    camposInsert: [
      'nombre',
      'cargo',
      'tipo_contrato',
      'fecha_inicio',
      'fecha_vencimiento_contrato',
      'estado',
      'obra_asignada',
    ],
  },
  faqs: {
    etiqueta: 'FAQs',
    tabla: 'faqs',
    campoClave: 'pregunta',
    columnas: [
      { clave: 'pregunta', etiqueta: 'Pregunta' },
      { clave: 'respuesta', etiqueta: 'Respuesta' },
      { clave: 'categoria', etiqueta: 'Categoría' },
    ],
    camposInsert: ['pregunta', 'respuesta', 'categoria'],
  },
}

// Devuelve la configuración de un tipo, o null si no es válido
export function configDeTipo(tipo) {
  return TIPOS[tipo] || null
}
