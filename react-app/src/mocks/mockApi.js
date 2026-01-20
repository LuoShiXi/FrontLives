// 备用方案：简单的内存 Mock API（不使用 Service Worker）
class MockAPI {
  constructor() {
    this.users = [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
    ]
  }

  // 拦截 fetch 请求
  interceptFetch() {
    const originalFetch = window.fetch

    window.fetch = async (url, options = {}) => {
      // 只拦截 API 请求
      if (typeof url === 'string' && url.startsWith('/api/')) {
        console.log('🎯 Mock API 拦截请求:', url, options.method || 'GET')

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 100))

        return this.handleRequest(url, options)
      }

      // 其他请求正常处理
      return originalFetch(url, options)
    }

    console.log('✅ Mock API 已启用')
  }

  async handleRequest(url, options) {
    const method = options.method || 'GET'

    if (url === '/api/test') {
      return this.createResponse({
        message: 'Mock API 工作正常!',
        timestamp: new Date().toISOString(),
        method: method
      })
    }

    if (url === '/api/users') {
      if (method === 'GET') {
        return this.createResponse({
          success: true,
          data: this.users,
          total: this.users.length
        })
      }

      if (method === 'POST') {
        try {
          const newUser = JSON.parse(options.body)
          if (!newUser.name || !newUser.email) {
            return this.createResponse({
              success: false,
              message: '姓名和邮箱不能为空'
            }, 400)
          }

          const user = {
            id: Date.now(),
            ...newUser
          }
          this.users.push(user)

          return this.createResponse({
            success: true,
            data: user
          }, 201)
        } catch (error) {
          return this.createResponse({
            success: false,
            message: '请求数据格式错误'
          }, 400)
        }
      }
    }

    // 其他请求返回 404
    return this.createResponse({ error: 'API 端点不存在' }, 404)
  }

  createResponse(data, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status: status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers({ 'Content-Type': 'application/json' })
    }
  }
}

// 创建全局实例
export const mockAPI = new MockAPI()

// 在开发环境中自动启用
if (import.meta.env.DEV) {
  mockAPI.interceptFetch()
}