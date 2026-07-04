# Empleia · Panel Unificado (demo)

Demo en forma de página web de la idea: **todos tus datos esparcidos, en un
solo dashboard**. Subes Excels, PDFs, imágenes, calendarios (.ics) o JSON, la
IA de Google Gemini los lee, los normaliza y los organiza automáticamente en
un panel con cifras clave, gráficos, agenda unificada y un resumen inteligente.

> Sigue la línea del "empleado de Onboarding" de Empleia, pero aquí **sin
> Supabase ni ningún backend**: solo el navegador + la API gratuita de Gemini.
> Todo se guarda en `localStorage`.

## Qué resuelve

En vez de tener la facturación en un Excel, el equipo en un PDF, las citas en
un calendario y el inventario en una foto de la pizarra, lo subes todo aquí y
obtienes **un único panel organizado** con todo cruzado.

## Qué hace

1. **Subida de archivos** (clic o arrastrar): Excel/CSV (se parsean con
   `xlsx`), PDF e imágenes (van en base64, Gemini los lee por visión/OCR),
   calendarios `.ics`, JSON y texto.
2. **Análisis con Gemini:** cada archivo vuelve normalizado como
   `{ titulo, categoria, resumen, columnas, registros, eventos, metricas }`.
3. **Dashboard unificado:** KPIs, registros por fuente (barras), reparto por
   categoría (barra apilada), próximos eventos de TODAS las fuentes en una
   agenda única y una tarjeta por fuente con su tabla desplegable.
4. **Resumen inteligente:** una segunda llamada a Gemini cruza todas las
   fuentes y devuelve titular, observaciones y acciones recomendadas.
5. **Modo ejemplo:** botón "Datos de ejemplo" para enseñar la demo completa
   **sin API key** ni archivos reales.

## API key de Gemini

Se puede configurar de dos formas (la del `.env` tiene prioridad):

- Desde la propia interfaz (botón "API key" de la barra lateral): se guarda en
  el `localStorage` del navegador. Es lo cómodo para la demo.
- Con `.env`: copia `.env.example` a `.env` y rellena `VITE_GEMINI_API_KEY`.

La key gratuita se crea en <https://aistudio.google.com/apikey>.

> ⚠️ **Seguridad:** al no haber backend, la key viaja/vive en el navegador.
> Úsala solo para la demo; en producción la llamada a Gemini debe moverse a
> una función serverless.

## Tecnología

- **React + Vite** (sin más dependencias de datos: nada de Supabase)
- **xlsx** para parsear Excel/CSV en el navegador
- **API de Google Gemini** (`gemini-2.5-flash-lite` por defecto, configurable
  con `VITE_GEMINI_MODEL`)
- Tipografía **Inter**, interfaz íntegramente en **español**, tema oscuro de
  Empleia (referencia visual del layout: el panel de lovable.dev)

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción
npm run preview  # previsualizar el build
```

## Deploy a Vercel (probar en iPad o cualquier dispositivo)

Importa el repo en Vercel apuntando a la rama
`claude/unified-data-dashboard-s9d8cd`. Detecta Vite solo y no necesita
ninguna variable de entorno obligatoria (la API key se puede meter desde la
interfaz). Si prefieres dejarla fija, añade `VITE_GEMINI_API_KEY` en Vercel y
pulsa **Redeploy** (Vite incrusta las variables en tiempo de build).

## Estructura de carpetas

```
src/
  App.jsx                    Estado y lógica principal (subida, análisis, resumen)
  index.css                  Sistema de diseño compartido de Empleia (tokens)
  lib/
    gemini.js                Llamadas a Gemini: analizar fuente + resumen global
    parseArchivo.js          Parseo de Excel/CSV, .ics/texto y base64
    categorias.js            Categorías fijas del panel y su color (paleta validada)
    almacen.js               Persistencia en localStorage (fuentes, resumen, key)
    ejemplo.js               Datos simulados del modo ejemplo
    visuales.js              Colores estables por nombre (avatares)
  components/
    Sidebar.jsx              Columna izquierda: navegación, fuentes, estado API key
    Hero.jsx                 Cabecera con degradado + zona de subida (drag & drop)
    Panel.jsx                Dashboard: agrega fuentes y reparte a los subcomponentes
    Kpis.jsx                 Fila de cifras clave
    GraficoFuentes.jsx       Barras de registros por fuente
    GraficoCategorias.jsx    Barra apilada de registros por categoría
    ProximosEventos.jsx      Agenda unificada de todas las fuentes
    ResumenIA.jsx            Resumen inteligente (segunda llamada a Gemini)
    TarjetaFuente.jsx        Tarjeta por fuente con métricas y tabla desplegable
    ModalApiKey.jsx          Modal para introducir la API key
    Iconos.jsx               Iconos SVG inline
    ErrorBoundary.jsx        Pantalla de error legible si algo revienta
```
