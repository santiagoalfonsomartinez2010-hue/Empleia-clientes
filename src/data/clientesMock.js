/*
  Datos simulados (mock) de los clientes en proceso de onboarding.
  FASE 1: sin backend real. Todo vive en memoria y se simula el
  comportamiento de subida/procesado de archivos. En la FASE 2 esto
  se reemplazará por consultas reales (Supabase u otra fuente).
*/

// Total de registros migrados "hoy" que se muestra en el sidebar.
export const TOTAL_MIGRADO_HOY = 47

// Estructura de un cliente:
//  - id, nombre, progreso (0-100)
//  - inicial + color: para el avatar del cliente
//  - documentos: documentos procesados hoy para ese cliente
//  - checklist: tareas de migración del cliente
export const clientesIniciales = [
  {
    id: 'reformas-europa',
    nombre: 'Reformas Europa',
    progreso: 80,
    inicial: 'RE',
    color: '#6366f1',
    documentos: [
      {
        id: 'doc-proveedores',
        nombre: 'proveedores_2024.xlsx',
        tipo: 'excel',
        estado: 'procesado', // 'procesado' | 'procesando'
        deteccion: '12 proveedores detectados',
        // Tabla de previsualización de datos extraídos (simulada)
        columnas: ['Nombre', 'Email', 'Categoría'],
        filas: [
          { nombre: 'Maderas García', email: 'info@maderasgarcia.es', categoria: 'Materiales' },
          { nombre: 'Pinturas Sol', email: 'ventas@pinturassol.com', categoria: 'Pintura' },
          {
            nombre: 'Pinturas Sol',
            email: 'contacto@pinturassol.com',
            categoria: 'Pintura',
            duplicado: true, // fila marcada como duplicado unificado
          },
          { nombre: 'Electricidad Ruiz', email: 'ruiz@electruiz.es', categoria: 'Electricidad' },
          { nombre: 'Fontanería Delta', email: 'pedidos@fontaneriadelta.es', categoria: 'Fontanería' },
          { nombre: 'Azulejos Mediterráneo', email: 'hola@azulejosmed.es', categoria: 'Materiales' },
        ],
      },
      {
        id: 'doc-equipo',
        nombre: 'equipo_interno.pdf',
        tipo: 'pdf',
        estado: 'procesado',
        deteccion: '8 miembros del equipo detectados',
        columnas: ['Nombre', 'Email', 'Categoría'],
        filas: [
          { nombre: 'Laura Méndez', email: 'laura@reformaseuropa.es', categoria: 'Dirección' },
          { nombre: 'Carlos Vidal', email: 'carlos@reformaseuropa.es', categoria: 'Obra' },
          { nombre: 'Ana Soto', email: 'ana@reformaseuropa.es', categoria: 'Administración' },
          { nombre: 'Jorge Pérez', email: 'jorge@reformaseuropa.es', categoria: 'Obra' },
        ],
      },
      {
        id: 'doc-logo',
        nombre: 'logo_reformas.png',
        tipo: 'imagen',
        estado: 'procesado',
        deteccion: 'Logo de marca detectado',
        columnas: ['Recurso', 'Tipo', 'Estado'],
        filas: [
          { nombre: 'logo_reformas.png', email: 'PNG · 512×512', categoria: 'Identidad' },
        ],
      },
    ],
    checklist: [
      { id: 'proveedores', etiqueta: 'Proveedores', registros: 12, completo: true },
      { id: 'equipo', etiqueta: 'Equipo', registros: 8, completo: true },
      { id: 'faqs', etiqueta: 'FAQs', registros: 6, completo: true },
      { id: 'catalogo', etiqueta: 'Catálogo de servicios', registros: 0, completo: false },
      { id: 'gmail', etiqueta: 'Conectar Gmail', registros: 0, completo: false },
    ],
  },
  {
    id: 'clinica-sonria',
    nombre: 'Clínica Sonría',
    progreso: 30,
    inicial: 'CS',
    color: '#10b981',
    documentos: [
      {
        id: 'doc-faqs-sonria',
        nombre: 'preguntas_frecuentes.pdf',
        tipo: 'pdf',
        estado: 'procesado',
        deteccion: '6 preguntas frecuentes detectadas',
        columnas: ['Nombre', 'Email', 'Categoría'],
        filas: [
          { nombre: '¿Aceptan seguros dentales?', email: '—', categoria: 'FAQ' },
          { nombre: '¿Cómo pido cita?', email: '—', categoria: 'FAQ' },
          { nombre: '¿Tienen urgencias?', email: '—', categoria: 'FAQ' },
          { nombre: '¿Hacen ortodoncia invisible?', email: '—', categoria: 'FAQ' },
        ],
      },
    ],
    checklist: [
      { id: 'faqs', etiqueta: 'FAQs', registros: 6, completo: true },
      { id: 'proveedores', etiqueta: 'Proveedores', registros: 0, completo: false },
      { id: 'equipo', etiqueta: 'Equipo', registros: 0, completo: false },
      { id: 'catalogo', etiqueta: 'Catálogo de servicios', registros: 0, completo: false },
      { id: 'gmail', etiqueta: 'Conectar Gmail', registros: 0, completo: false },
    ],
  },
]

/*
  Plantillas de archivos simulados que se pueden "subir" desde la
  zona de trabajo (botones de prueba). Cada plantilla genera un nuevo
  documento que empieza en estado "procesando" y, tras 2 segundos,
  pasa a "procesado" mostrando estos datos de ejemplo extraídos.
*/
export const plantillasSubida = {
  excel: {
    nombre: 'catalogo_servicios.xlsx',
    tipo: 'excel',
    deteccion: '5 servicios detectados',
    columnas: ['Nombre', 'Email', 'Categoría'],
    filas: [
      { nombre: 'Reforma integral', email: '—', categoria: 'Servicio' },
      { nombre: 'Pintura de interiores', email: '—', categoria: 'Servicio' },
      {
        nombre: 'Pintura interior',
        email: '—',
        categoria: 'Servicio',
        duplicado: true,
      },
      { nombre: 'Instalación eléctrica', email: '—', categoria: 'Servicio' },
      { nombre: 'Reforma de baños', email: '—', categoria: 'Servicio' },
    ],
  },
  pdf: {
    nombre: 'contrato_marco.pdf',
    tipo: 'pdf',
    deteccion: '3 cláusulas clave detectadas',
    columnas: ['Nombre', 'Email', 'Categoría'],
    filas: [
      { nombre: 'Plazo de entrega', email: '—', categoria: 'Cláusula' },
      { nombre: 'Garantía de obra', email: '—', categoria: 'Cláusula' },
      { nombre: 'Forma de pago', email: '—', categoria: 'Cláusula' },
    ],
  },
  imagen: {
    nombre: 'tarjeta_visita.jpg',
    tipo: 'imagen',
    deteccion: '1 contacto detectado por OCR',
    columnas: ['Nombre', 'Email', 'Categoría'],
    filas: [
      { nombre: 'Miguel Ángel Torres', email: 'mtorres@cliente.es', categoria: 'Contacto' },
    ],
  },
}
