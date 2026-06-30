# Empleia · Empleado de Onboarding

Herramienta **interna** de Empleia para migrar la información de clientes nuevos
hacia el sistema. La usa únicamente el equipo de Empleia (no la ve el cliente).

> **Fase 1 (actual):** frontend con datos simulados. No hay backend real: la
> subida y el procesado de archivos están simulados en memoria.
> **Fase 2 (pendiente):** conectar a Supabase y al procesado real de documentos.

## Tecnología

- **React + Vite**
- Sin dependencias de UI externas (iconos SVG inline)
- Tipografía **Inter**, interfaz íntegramente en **español**

## Diseño

Comparte el mismo sistema de diseño que el resto de "empleados" de Empleia
(definido en `src/index.css`):

| Token             | Valor     | Uso                          |
| ----------------- | --------- | ---------------------------- |
| Fondo             | `#0B0D14` | fondo general                |
| Card              | `#0F1117` | cards y paneles              |
| Borde             | `#1E2130` | bordes y separadores         |
| Violeta           | `#6366F1` | acción principal / activo    |
| Verde             | `#10B981` | éxito / procesado / en línea |
| Amarillo          | `#F59E0B` | pendiente / advertencia      |

## Estructura de la pantalla

Layout de **2 columnas** (sin chat: es una herramienta de trabajo):

1. **Sidebar (260px):** avatar del empleado con punto verde, nombre/rol, lista
   de clientes en proceso (clicables), botón de nuevo cliente y total migrado hoy.
2. **Zona de trabajo:** selector del cliente activo, zona de arrastrar/subir
   documentos, lista de documentos procesados hoy (cards expandibles con tabla
   de previsualización y botones de confirmar/editar) y checklist del cliente.

## Probar la simulación de subida

En la zona de trabajo hay botones de prueba (**Simular subida de Excel / PDF /
imagen**). Al pulsarlos, el documento aparece en estado **⏳ Procesando** durante
2 segundos y luego pasa a **✅ Procesado** mostrando datos de ejemplo extraídos.
También se puede arrastrar un archivo real sobre la zona punteada (se simula
según su extensión).

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
  App.jsx                  Estado y lógica principal (2 columnas)
  index.css                Sistema de diseño compartido (tokens de color)
  data/clientesMock.js     Datos simulados de clientes y plantillas de subida
  components/
    Sidebar.jsx            Columna 1
    ZonaTrabajo.jsx        Columna 2
    DocumentoCard.jsx      Card de documento expandible
    TablaPrevisualizacion.jsx  Tabla de datos extraídos + acciones
    Checklist.jsx          Checklist con barra de progreso
    Badge.jsx              Badge de estado reutilizable
    Iconos.jsx             Iconos SVG inline
```
