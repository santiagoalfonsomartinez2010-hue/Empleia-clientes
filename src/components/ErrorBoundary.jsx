import { Component } from 'react'

/*
  Barrera de errores: si algo falla durante el render, en vez de dejar la
  pantalla en negro, muestra un mensaje legible con la causa. Usa estilos
  en línea para funcionar aunque el CSS no cargue.
*/
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Error en la aplicación:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#0b0d14',
            color: '#e6e8ef',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div style={{ maxWidth: 460, textAlign: 'center' }}>
            <h1 style={{ fontSize: 18, marginBottom: 12, color: '#f59e0b' }}>
              No se pudo cargar la aplicación
            </h1>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#9aa0b4' }}>
              {this.state.error.message}
            </p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
