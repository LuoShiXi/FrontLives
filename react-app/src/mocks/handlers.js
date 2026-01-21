import { http, HttpResponse } from 'msw'
import testData from './data/test.json'
import usersGetData from './data/users-get.json'
import usersPostSuccessData from './data/users-post-success.json'
import usersPostErrorData from './data/users-post-error.json'

export const handlers = [
  // 简单的测试接口
  http.get('/api/test', () => {
    const response = { ...testData }
    response.timestamp = new Date().toISOString()
    return HttpResponse.json(response)
  }),

  // 获取用户列表
  http.get('/api/users', () => {
    return HttpResponse.json(usersGetData)
  }),

  // 创建用户
  http.post('/api/users', async ({ request }) => {
    try {
      const newUser = await request.json()

      if (!newUser.name || !newUser.email) {
        return HttpResponse.json(usersPostErrorData.validationError, { status: 400 })
      }

      const response = { ...usersPostSuccessData }
      response.data = {
        id: Date.now(), // 使用时间戳作为ID
        ...newUser
      }

      return HttpResponse.json(response, { status: 201 })
    } catch {
      return HttpResponse.json(usersPostErrorData.formatError, { status: 400 })
    }
  })
]