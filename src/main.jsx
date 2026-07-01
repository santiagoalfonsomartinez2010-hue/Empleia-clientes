import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

// Punto de entrada de la aplicación del empleado de Onboarding.
// Envuelto en ErrorBoundary para que cualquier fallo muestre un mensaje
// legible en vez de dejar la pantalla en negro.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
