import React, { useState } from 'react'
import './App.css'

function App() {
  const [testResults, setTestResults] = useState({})

  const testAPI = async (endpoint, name) => {
    try {
      console.log(`测试 ${name}...`)
      const startTime = Date.now()
      const response = await fetch(endpoint)
      const endTime = Date.now()
      const data = await response.json()

      const result = {
        success: true,
        status: response.status,
        responseTime: endTime - startTime,
        data: data
      }

      console.log(`${name} 响应:`, result)
      setTestResults(prev => ({ ...prev, [name]: result }))

      alert(`${name} 成功!\n状态码: ${response.status}\n响应时间: ${endTime - startTime}ms\n数据: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      console.error(`${name} 测试失败:`, error)
      const result = {
        success: false,
        error: error.message
      }
      setTestResults(prev => ({ ...prev, [name]: result }))
      alert(`${name} 失败: ${error.message}`)
    }
  }

  const testMSW = () => testAPI('/api/test', 'MSW 测试接口')
  const testUsers = () => testAPI('/api/users', '用户 API')

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>MSW 集成测试</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testMSW}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          测试 /api/test 接口
        </button>

        <button
          onClick={testUsers}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          测试 /api/users 接口
        </button>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>测试说明:</h3>
        <ul>
          <li>点击按钮测试不同的 API 接口</li>
          <li>查看浏览器控制台了解详细日志</li>
          <li>检查 Network 标签页确认请求被 MSW 拦截</li>
          <li>如果失败，检查 Application 标签页的 Service Workers</li>
        </ul>
      </div>

      {/* 测试结果显示 */}
      {Object.keys(testResults).length > 0 && (
        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>测试结果:</h3>
          {Object.entries(testResults).map(([name, result]) => (
            <div key={name} style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: result.success ? '#d4edda' : '#f8d7da',
              borderRadius: '4px'
            }}>
              <strong>{name}:</strong> {result.success ? '✅ 成功' : '❌ 失败'}
              {result.success && (
                <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                  (状态码: {result.status}, 响应时间: {result.responseTime}ms)
                </span>
              )}
              {result.error && <div style={{ fontSize: '12px', marginTop: '5px' }}>错误: {result.error}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>配置说明:</h3>
        <ul>
          <li><strong>MSW (推荐):</strong> 使用 Service Worker 拦截真实网络请求</li>
          <li><strong>Mock API (备用):</strong> 如果 MSW 失败，自动启用内存模拟</li>
          <li><strong>自动检测:</strong> 系统会自动选择可用的模拟方案</li>
        </ul>

        <h4>文件结构:</h4>
        <ul>
          <li><code>src/mocks/handlers.js</code> - MSW API 处理器</li>
          <li><code>src/mocks/browser.js</code> - MSW 浏览器配置</li>
          <li><code>src/mocks/mockApi.js</code> - 备用 Mock API</li>
          <li><code>public/mockServiceWorker.js</code> - Service Worker</li>
        </ul>
      </div>
    </div>
  )
}

export default App