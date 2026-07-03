# Empleia · Empleado de Onboarding

Herramienta **interna** de Empleia para migrar la información de clientes nuevos
hacia el sistema. La usa únicamente el equipo de Empleia (no la ve el cliente).

> **Fase 2 (actual):** conectado a **Supabase** (clientes, documentos, proveedores,
> empleados, FAQs…) y a la **API de Google Gemini** para analizar documentos reales.
> **Fase 1:** frontend con datos simulados (ya superada).

## Probarlo en el iPad (o cualquier dispositivo) — Deploy a Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsantiagoalfonsomartinez2010-hue%2FEmpleia-clientes%2Ftree%2Fclaude%2Fempleia-onboarding-frontend-okpohb&env=VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY,VITE_GEMINI_API_KEY&envDescription=Claves%20necesarias%3A%20Supabase%20(URL%20%2B%20anon%20key)%20y%20la%20API%20key%20de%20Gemini&project-name=empleia-onboarding&repository-name=empleia-onboarding)

Al pulsar el botón, Vercel:
1. Te pide iniciar sesión con GitHub (si no lo has hecho).
2. Clona esta rama (`claude/empleia-onboarding-frontend-okpohb`) a un repo nuevo en tu cuenta.
3. Te pide rellenar las 3 variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`).
4. Despliega automáticamente (detecta Vite solo) y te da una URL pública para abrir en Safari.

Si más adelante cambias una variable de entorno en Vercel, tienes que pulsar **Redeploy** para que el nuevo build la incluya (Vite las incrusta en tiempo de build).

## Tecnología

- **React + Vite**
- **@supabase/supabase-js** para la base de datos
- **xlsx** para parsear Excel/CSV en el navegador
- **API de Google Gemini** (`gemini-2.5-flash-lite`) para extraer datos de los documentos
- Tipografía **Inter**, interfaz íntegramente en **español**

## Configuración (.env)

Copia `.env.example` a `.env` y rellena:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GEMINI_API_KEY=tu-gemini-api-key
```

> ⚠️ **Seguridad:** al no haber backend todavía, la `VITE_GEMINI_API_KEY` se
> incrusta en el bundle del navegador y es extraíble por cualquiera que acceda a
> la herramienta. La key anónima de Supabase **sí** está pensada para el cliente
> (protégela con RLS); la de Gemini **no**. Úsala solo en esta herramienta
> interna y, en una próxima fase, mueve la llamada a la API a una función
> serverless/Edge.

## Qué hace (funcionalidad real)

1. **Clientes reales:** al abrir la app se consulta `clientes_empresa` y se
   muestran en el sidebar. "+ Nuevo cliente" abre un formulario (nombre, sector,
   ciudad) que inserta una fila nueva.
2. **Análisis de documentos:** al subir un archivo real (Excel/CSV se parsean con
   `xlsx`; PDF/imágenes se mandan en base64), se llama a la API de Gemini con
   un prompt que devuelve un JSON `{ tipo, registros }` (proveedores, empleados o
   FAQs). Mientras tanto la card muestra **⏳ Procesando**.
3. **Detección de duplicados:** antes de previsualizar, se consultan los registros
   existentes del cliente y se comparan por similitud de texto (ignora
   mayúsculas/espacios y detecta si un nombre contiene al otro). Las filas
   duplicadas se marcan con ⚠️.
4. **Inserción real:** al pulsar "Confirmar e insertar" se insertan las filas no
   duplicadas en `proveedores`/`empleados`/`faqs`, se registra el documento en
   `documentos_procesados` y se actualiza `porcentaje_completado` del cliente.
5. **Checklist con datos reales:** cuenta filas reales en `proveedores`,
   `empleados`, `faqs` y `productos_servicios` para el cliente activo.

## Tablas de Supabase usadas

`clientes_empresa`, `documentos_procesados`, `proveedores`, `empleados`, `faqs`,
`productos_servicios`. (Ya existen en Supabase; la app no las crea.)

## Diseño

Mismo sistema de diseño que el resto de "empleados" de Empleia
(definido en `src/index.css`): fondo `#0B0D14`, cards `#0F1117`, bordes
`#1E2130`, violeta `#6366F1`, verde `#10B981`, amarillo `#F59E0B`, tipografía
Inter. Layout de **2 columnas** (sidebar + zona de trabajo), sin chat.

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción
npm run preview  # previsualizar el build
```

## Estructura de carpetas

```
src/
  App.jsx                  Estado y lógica principal (carga real, subida, inserción)
  supabaseClient.js        Cliente de Supabase desde el .env
  index.css                Sistema de diseño compartido (tokens de color)
  lib/
    gemini.js              Llamada a la API de Gemini para analizar documentos
    parseArchivo.js        Parseo de Excel/CSV y conversión a base64
    similitud.js           Detección de duplicados por similitud de texto
    tiposDeteccion.js      Config de columnas/tabla/campos por tipo detectado
    visuales.js            Iniciales y color de avatar por cliente
  services/
    onboardingService.js   Todas las consultas a Supabase
  components/
    Sidebar.jsx            Columna 1 (clientes reales, total migrado hoy)
    ZonaTrabajo.jsx        Columna 2 (subida real de archivos)
    ModalNuevoCliente.jsx  Formulario de alta de cliente
    DocumentoCard.jsx      Card de documento (procesando / procesado / error / histórico)
    TablaPrevisualizacion.jsx  Tabla de datos extraídos + acciones
    Checklist.jsx          Checklist con barra de progreso
    Badge.jsx              Badge de estado reutilizable
    Iconos.jsx             Iconos SVG inline
```
