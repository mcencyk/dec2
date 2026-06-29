import { createRoot } from 'react-dom/client'
import 'maplibre-gl/dist/maplibre-gl.css'
import './index.css'
import App from './App.tsx'

// Chrome: backdrop-filter doesn't blur WebGL canvas (Chromium compositing limitation).
// Detect Chrome and add class so CSS can raise panel opacity as fallback.
const ua = navigator.userAgent
if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
  document.documentElement.classList.add('browser-chrome')
}

createRoot(document.getElementById('root')!).render(<App />)
