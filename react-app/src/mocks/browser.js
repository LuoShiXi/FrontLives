import { setupWorker } from 'msw/browser'
import { handlers } from './handlers.js'

// 创建 worker 实例并立即启动
export const worker = setupWorker(...handlers)

// 开发环境下自动启动
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
    quiet: false
  }).then(() => {
    console.log('🚀 MSW 已启动 - 所有 API 请求将被拦截')
  }).catch((error) => {
    console.error('❌ MSW 启动失败:', error)
  })
}