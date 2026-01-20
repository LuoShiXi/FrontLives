import { http, HttpResponse } from 'msw'

export const handlers = [
  // 简单的测试接口
  http.get('/api/test', () => {
    return HttpResponse.json({
      message: 'MSW is working!',
      timestamp: new Date().toISOString()
    })
  }),

  // 获取用户列表
  http.get('/api/users', () => {
    const users = [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
    ]

    return HttpResponse.json({
      success: true,
      data: users,
      total: users.length
    })
  }),

  // 创建用户
  http.post('/api/users', async ({ request }) => {
    try {
      const newUser = await request.json()

      if (!newUser.name || !newUser.email) {
        return HttpResponse.json({
          success: false,
          message: '姓名和邮箱不能为空'
        }, { status: 400 })
      }

      const user = {
        id: Date.now(), // 使用时间戳作为ID
        ...newUser
      }

      return HttpResponse.json({
        success: true,
        data: user
      }, { status: 201 })
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: '请求数据格式错误'
      }, { status: 400 })
    }
  })
]