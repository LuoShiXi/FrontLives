# D3 赛车柱状图 (Racing Bar Chart)

一个基于 D3.js 的动态排名可视化图表，展示数据随时间的变化和排名变化。

## 🚀 快速开始

### 方式一：使用 Python 启动服务器（推荐）

```bash
# Python 3
cd h5
python -m http.server 8000

# 然后在浏览器中访问
# http://localhost:8000/D3-zhuzhuangtu.html
```

### 方式二：使用 Node.js 启动服务器

```bash
# 安装 serve（如果还没有）
npm install -g serve

# 启动服务器
cd h5
serve

# 然后在浏览器中访问显示的地址
```

### 方式三：使用 VS Code Live Server

1. 安装 VS Code 的 "Live Server" 插件
2. 右键点击 `D3-zhuzhuangtu.html` 文件
3. 选择 "Open with Live Server"

## 📁 文件说明

- `D3-zhuzhuangtu.html` - 主 HTML 文件，包含完整的图表实现
- `config.json` - 默认配置文件，包含图表的所有配置和数据
- `datas/` - 数据文件夹，可以存放其他 JSON 数据文件

## ⚙️ 配置说明

### 修改配置

有两种方式修改配置：

1. **直接编辑 `config.json` 文件**
   - 修改后刷新浏览器即可看到效果

2. **通过可视化配置面板**
   - 点击页面右上角的 "⚙️ 配置" 按钮
   - 在配置面板中修改各项设置
   - 点击 "应用配置" 生效
   - 可以点击 "导出JSON" 保存配置

### 配置结构

```json
{
  "title": "图表标题",
  "keyframes": [
    {
      "date": "2020",
      "data": [
        { "name": "名称", "value": 数值 }
      ]
    }
  ],
  "colors": {
    "default": "#3b82f6",
    "special": "#e31937",
    "firstPlace": "#76b900"
  },
  "specialItems": ["需要特殊标记的项目名称"],
  "valueFormat": {
    "prefix": "$",
    "suffix": "B",
    "decimals": 1,
    "useCommas": true
  },
  "animation": {
    "interpolationSteps": 80,
    "durationPerKeyframe": 5000,
    "topN": 10
  },
  "chart": {
    "maxValue": null,
    "barHeight": 60,
    "barStartX": 200
  }
}
```

## 🎨 功能特性

- ✅ 动态排名变化动画
- ✅ 平滑的过渡效果
- ✅ 可配置的颜色方案
- ✅ 特殊项目高亮
- ✅ 自定义数值格式
- ✅ 响应式布局
- ✅ 播放/暂停/重播控制
- ✅ 年份翻页动画

## ⚠️ 注意事项

**为什么需要启动服务器？**

由于浏览器的 CORS（跨域资源共享）安全策略，直接双击打开 HTML 文件（使用 `file://` 协议）时，无法通过 `fetch` API 加载本地 JSON 文件。

通过 HTTP 服务器运行可以解决这个问题，因为：
- HTTP 协议允许加载同源资源
- 服务器会正确设置响应头
- 符合浏览器的安全策略

## 🔧 故障排除

### 问题：配置加载失败

**解决方案：**
1. 确保通过 HTTP 服务器运行（不是直接打开文件）
2. 检查 `config.json` 文件是否存在
3. 检查 JSON 格式是否正确（可以使用 JSON 验证工具）
4. 查看浏览器控制台的错误信息

### 问题：图表不显示

**解决方案：**
1. 检查 `config.json` 中是否有 `keyframes` 数据
2. 确保每个 keyframe 都有 `data` 数组
3. 检查浏览器控制台是否有 JavaScript 错误

## 📝 更新日志

- 优化代码结构，将配置从内部移到外部 JSON 文件
- 添加异步加载配置功能
- 改进错误处理和用户提示
- 优化动画性能
