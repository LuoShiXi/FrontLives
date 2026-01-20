import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 尝试启用 MSW，如果失败则使用备用 Mock API
if (import.meta.env.DEV) {
  // 首先尝试 MSW
  import('./mocks/browser.js').then(() => {
    console.log('🎉 MSW 集成成功')
  }).catch((error) => {
    console.warn('⚠️ MSW 加载失败，使用备用 Mock API:', error.message)
    // 如果 MSW 失败，使用备用方案
    import('./mocks/mockApi.js')
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
