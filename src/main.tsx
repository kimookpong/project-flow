import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

console.log('🚀 main.tsx is starting...')

const rootElement = document.getElementById('root')
console.log('📍 Root element:', rootElement)

if (!rootElement) {
  console.error('❌ Root element not found!')
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
  console.log('✅ Render called')
}
