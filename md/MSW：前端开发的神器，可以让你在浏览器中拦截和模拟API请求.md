# MSW：前端开发的神器，可以让你在浏览器中拦截和模拟API请求

本文约 2800 字，阅读完大约 8 分钟。

HELLO ，这里是技术工具分享栏目。

分享各种有趣的技术工具和开发技巧~

前端开发的时候，后端接口还没准备好，怎么办？写一堆 mock 数据？用 json-server？还是直接在代码里写死数据？

这小东西在前端开发里太常见了，特别是做原型验证、接口联调、单元测试的时候...

## 为什么需要 MSW？

想象一下这样的场景：你在做一个电商网站，用户登录功能还没开发完，但你想先把前端的登录界面做出来。

传统做法：
- 写个假的登录接口，返回硬编码的数据
- 用 json-server 起个本地服务器
- 或者直接在前端代码里模拟

这些方法都挺麻烦的：
- 代码里到处是 `if (process.env.NODE_ENV === 'development')` 这样的判断
- 测试的时候还要手动切换环境
- 接口格式变了，还要同步修改多处代码

MSW 的出现，就是为了解决这个问题。它可以在浏览器层面拦截真实的网络请求，然后返回你预设的模拟数据。

**核心优势：**
- **无缝集成**：开发和生产环境使用相同的代码
- **类型安全**：支持 TypeScript，完全类型化
- **真实模拟**：模拟真实的 HTTP 响应，包括状态码、headers 等
- **测试友好**：天然支持单元测试和集成测试

## 项目信息

项目仓库：[https://github.com/mswjs/msw](https://github.com/mswjs/msw)
npm 包：[https://www.npmjs.com/package/msw](https://www.npmjs.com/package/msw)
官网：[https://mswjs.io](https://mswjs.io)
英文文档：[https://mswjs.io/docs](https://mswjs.io/docs)
中文文档：暂无
star 数量：17.3k (17313)
开源协议：MIT
npm 周下载量：678.6万 (6785560)
jsDelivr 月请求次数：暂无统计
最新版本：2.12.7
兼容性：Node.js ≥18, 现代浏览器 (支持 Service Worker)
文件大小：4.47 MB (unpacked)
依赖数量：18 个三方包
更新状态：活跃中

---

## 安装

### npm 安装

```bash
npm install msw --save-dev
```

### 初始化 MSW

安装完成后，需要初始化 MSW，它会自动创建必要的文件和配置：

```bash
npx msw init public/ --save
```

这个命令会在你的 `public` 目录下创建 `mockServiceWorker.js` 文件，这是 MSW 的核心 Service Worker 文件。

### 依赖导入

```javascript
// ESM 方式
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw'

// CommonJS 方式
const { http, HttpResponse } = require('msw')
const { setupWorker } = require('msw')
```

## 示例

让我们通过一个完整的例子来了解 MSW 的用法。假设我们要开发一个用户管理系统，需要模拟用户列表和创建用户的 API。

### 项目结构

首先创建这样的项目结构：

```
my-app/
├── public/
│   └── mockServiceWorker.js  # MSW 初始化时自动创建
├── src/
│   ├── mocks/
│   │   ├── handlers.js       # 请求处理器
│   │   └── browser.js        # 浏览器环境配置
│   ├── App.js
│   └── index.js
└── package.json
```

### 配置请求处理器

创建 `src/mocks/handlers.js`：

```javascript
import { http, HttpResponse } from 'msw'

// 模拟用户数据
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
]

export const handlers = [
  // 获取用户列表
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: users,
      total: users.length
    })
  }),

  // 获取单个用户
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params
    const user = users.find(u => u.id === parseInt(id))

    if (!user) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json({
      success: true,
      data: user
    })
  }),

  // 创建用户
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json()

    // 简单的验证
    if (!newUser.name || !newUser.email) {
      return HttpResponse.json({
        success: false,
        message: '姓名和邮箱不能为空'
      }, { status: 400 })
    }

    // 分配 ID 并添加到列表
    const user = {
      id: users.length + 1,
      ...newUser
    }
    users.push(user)

    return HttpResponse.json({
      success: true,
      data: user
    }, { status: 201 })
  }),

  // 更新用户
  http.put('/api/users/:id', async ({ request, params }) => {
    const { id } = params
    const updates = await request.json()
    const userIndex = users.findIndex(u => u.id === parseInt(id))

    if (userIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    users[userIndex] = { ...users[userIndex], ...updates }

    return HttpResponse.json({
      success: true,
      data: users[userIndex]
    })
  }),

  // 删除用户
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params
    const userIndex = users.findIndex(u => u.id === parseInt(id))

    if (userIndex === -1) {
      return new HttpResponse(null, { status: 404 })
    }

    users.splice(userIndex, 1)

    return HttpResponse.json({
      success: true,
      message: '用户删除成功'
    })
  })
]
```

### 浏览器环境配置

创建 `src/mocks/browser.js`：

```javascript
import { setupWorker } from 'msw'
import { handlers } from './handlers'

// 创建 worker 实例
export const worker = setupWorker(...handlers)
```

### 在应用中启用 MSW

在 `src/index.js` 中添加：

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// 只在开发环境中启用 MSW
if (process.env.NODE_ENV === 'development') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass'  // 未处理的请求直接放行
    })
  })
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### 使用示例

创建 `src/App.js`：

```javascript
import React, { useState, useEffect } from 'react'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newUser, setNewUser] = useState({ name: '', email: '' })

  // 获取用户列表
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data.data)
        setLoading(false)
      })
  }, [])

  // 创建用户
  const handleSubmit = async (e) => {
    e.preventDefault()

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    })

    const result = await response.json()

    if (result.success) {
      setUsers([...users, result.data])
      setNewUser({ name: '', email: '' })
    } else {
      alert(result.message)
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>用户管理系统</h1>

      {/* 用户列表 */}
      <div>
        <h2>用户列表</h2>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      </div>

      {/* 添加用户表单 */}
      <div>
        <h2>添加用户</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="姓名"
            value={newUser.name}
            onChange={e => setNewUser({...newUser, name: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="邮箱"
            value={newUser.email}
            onChange={e => setNewUser({...newUser, email: e.target.value})}
            required
          />
          <button type="submit">添加</button>
        </form>
      </div>
    </div>
  )
}

export default App
```

### 运行效果

启动应用后：

1. **用户列表**：页面会显示预设的用户数据
2. **添加用户**：填写表单提交后，新用户会立即出现在列表中
3. **网络请求**：在浏览器开发者工具的 Network 标签页，你会看到真实的 HTTP 请求，但响应来自 MSW
4. **数据持久化**：数据存储在内存中，页面刷新后重置（这正是我们想要的模拟行为）

**注意：** 记得在生产环境中移除 MSW 的启用代码，确保不会影响到线上环境。

## 支持的协议类型

MSW 不仅仅支持传统的 HTTP 请求，它还支持多种现代 Web 协议，让你能够模拟各种类型的网络通信：

### 1. RESTful API (HTTP/HTTPS)

这是 MSW 最常用的场景，支持所有 HTTP 方法：

```javascript
import { http, HttpResponse } from 'msw'

export const handlers = [
  // GET 请求
  http.get('/api/users', () => {
    return HttpResponse.json({ users: [] })
  }),

  // POST 请求
  http.post('/api/users', async ({ request }) => {
    const userData = await request.json()
    return HttpResponse.json(userData, { status: 201 })
  }),

  // PUT 请求
  http.put('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, updated: true })
  }),

  // DELETE 请求
  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 204 })
  })
]
```

### 2. GraphQL API

MSW 完全支持 GraphQL 查询和变更：

```javascript
import { graphql, HttpResponse } from 'msw'

export const handlers = [
  // GraphQL 查询
  graphql.query('GetUsers', () => {
    return HttpResponse.json({
      data: {
        users: [
          { id: '1', name: '张三', email: 'zhangsan@example.com' }
        ]
      }
    })
  }),

  // GraphQL 变更
  graphql.mutation('CreateUser', ({ variables }) => {
    const { name, email } = variables
    return HttpResponse.json({
      data: {
        createUser: {
          id: '2',
          name,
          email,
          createdAt: new Date().toISOString()
        }
      }
    })
  })
]
```

### 3. WebSocket 连接

可以模拟 WebSocket 通信，包括消息发送和接收：

```javascript
import { ws } from 'msw'

export const handlers = [
  ws.link('wss://api.example.com/chat', ({ onOpen, onMessage, onClose }) => {
    onOpen(() => {
      console.log('WebSocket 连接已建立')
    })

    onMessage((event) => {
      const message = JSON.parse(event.data)

      // 模拟服务器回复
      if (message.type === 'join') {
        return new ws.OutgoingMessage('joined', {
          userId: message.userId,
          timestamp: Date.now()
        })
      }

      // 广播消息给其他客户端
      return new ws.OutgoingMessage('message', {
        from: message.userId,
        content: message.content,
        timestamp: Date.now()
      })
    })

    onClose(() => {
      console.log('WebSocket 连接已关闭')
    })
  })
]
```

### 4. Server-Sent Events (SSE)

支持服务器推送事件，模拟实时数据流：

```javascript
import { sse } from 'msw'

export const handlers = [
  sse.link('*/api/events', ({ onOpen, onClose }) => {
    let intervalId

    onOpen(() => {
      console.log('SSE 连接已建立')

      // 每秒发送一次事件
      intervalId = setInterval(() => {
        return new sse.OutgoingMessage('price-update', {
          symbol: 'AAPL',
          price: Math.random() * 200,
          timestamp: Date.now()
        })
      }, 1000)
    })

    onClose(() => {
      console.log('SSE 连接已关闭')
      clearInterval(intervalId)
    })
  })
]
```

### 高级功能

MSW 还支持一些高级的模拟功能：

#### 模拟网络延迟

```javascript
http.get('/api/slow-endpoint', async () => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000))

  return HttpResponse.json({ data: '延迟响应' })
})
```

#### 模拟错误状态

```javascript
http.get('/api/unstable', () => {
  // 随机返回成功或失败
  const shouldFail = Math.random() > 0.8

  if (shouldFail) {
    return new HttpResponse(
      JSON.stringify({ error: '服务器内部错误' }),
      { status: 500 }
    )
  }

  return HttpResponse.json({ success: true })
})
```

#### 模拟文件上传

```javascript
http.post('/api/upload', async ({ request }) => {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!file) {
    return HttpResponse.json(
      { error: '未找到文件' },
      { status: 400 }
    )
  }

  // 模拟文件处理
  return HttpResponse.json({
    success: true,
    fileId: 'file_' + Date.now(),
    filename: file.name,
    size: file.size
  })
})
```

通过这些丰富的协议支持，MSW 让你能够在前端开发过程中模拟几乎所有的网络通信场景，大大提升了开发和测试的效率。

## 最后

MSW 真的改变了前端开发的体验。以前你要么写一堆条件判断的代码，要么维护额外的 mock 服务器。现在只需要几行代码，就能让你的应用在开发阶段拥有完整的 API 支持。

我觉得 MSW 最厉害的地方在于它的**真实性**。它不只是返回 JSON 数据，而是完整模拟了 HTTP 请求的方方面面——状态码、headers、甚至是网络延迟。这让前端开发体验和生产环境几乎没有差别。

当然，MSW 也不是万能的。对于一些复杂的后端逻辑（比如数据库操作、文件上传等），你可能还需要额外的 mock 工具。但对于大部分的 CRUD 操作和数据接口，MSW 已经足够用了。

强烈建议你在下一个前端项目中试试 MSW。相信我，一旦用了，你就不会想回去用老办法了~~

如果对文章有任何疑问，欢迎评论留言讨论~~



如果觉得文章对您有帮助，欢迎关注、一键三连~~