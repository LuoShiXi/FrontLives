# OpenCode：开源 AI 编程助手，你的终端开发“神注脚”，可以代替 Cursor/Copilot

本文约 1200 字，阅读完大约 6 分钟。

HELLO ，这里是【开源速递】。

分享各种好用、有趣的开源工具~

在 AI 辅助开发的今天，Cursor 和 Copilot 已经成了不少开发者的标配。但老实说，频繁在编辑器和浏览器文档之间跳转，或者手动复制粘贴到终端运行命令，这种“上下文切换”的成本还是不低的。

如果你也是一个“终端重度依赖者”，那么 OpenCode 绝对值得你看看。它直接把 AI 的能力搬进了你的终端，不仅能写代码，还能直接帮你执行命令。

---

### OpenCode 是什么？

OpenCode 是一个开源的 AI 编程助手，专门为终端设计。它的核心优势就在于“上下文感应”和“直接执行”。它不仅知道你现在的代码文件在干什么，还能直接根据你的自然语言需求，生成 shell 命令并询问你是否执行。

这种“对话即操作”的体验，在处理复杂的 Git 操作、环境配置或者文件批量处理时，简直是效率神器。

### 项目信息

项目仓库：https://github.com/opencode-ai/opencode
npm 包：https://www.npmjs.com/package/opencode-ai
官网：https://opencode.ai
英文文档：https://opencode.ai/docs
中文文档：暂无
star 数量：71.2k (71234)
开源协议：MIT
npm 周下载量：5.2k
jsDelivr 月请求次数：12.5k
最新版本：v0.0.55
兼容性：Node.js >= 16
文件大小：1.8MB
依赖数量：12 个三方包
更新状态：活跃中

---

## 安装

OpenCode 的安装非常简单，只要你环境里有 Node.js 即可。

### 1. npm 全局安装

```bash
npm install -g opencode-ai
```

### 2. 初始化配置

首次运行时，你需要配置你的 LLM API Key（支持 OpenAI, Anthropic, Google Gemini 等）：

```bash
opencode --config
```

按照提示输入你的 API Key 和偏好的模型即可。

---

## 示例

演示一个在“文件批量处理”和“代码重构”场景中的例子。

### 场景一：批量查找并清理大文件

如果你想找出当前目录下超过 100MB 的文件并删除它们，不需要去查复杂的 `find` 命令参数：

**操作：**
```bash
opencode "帮我找出当前目录及子目录下所有大于 100MB 的 .log 文件并删除"
```

**OpenCode 响应：**
```bash
# 生成的命令：
find . -type f -name "*.log" -size +100M -delete

# 询问：是否执行该命令？(y/n)
```

### 场景二：重构代码逻辑

假设你有一个旧的 Python 脚本，想要把它改成异步模式。

**核心文件 `old_script.py`：**
```python
import requests

def fetch_data(url):
    response = requests.get(url)
    return response.json()

if __name__ == "__main__":
    print(fetch_data("https://api.example.com/data"))
```

**操作：**
```bash
opencode "请将 old_script.py 重构为使用 httpx 和 asyncio 的异步版本"
```

**运行效果：**
OpenCode 会读取文件内容，然后在终端中直接给出重构后的代码块，甚至可以帮你自动保存到新文件。

**注意：** 在执行任何涉及文件删除或系统更改的命令前，**务必仔细检查** AI 生成的 shell 命令，避免不必要的损失。

---

## 最后

老实说，OpenCode 并不是要完全取代 Cursor，但在处理“终端原生任务”时，它的体验确实更胜一筹。它让 AI 真正成为了你操作系统的“领航员”，而不是仅仅停留在编辑器里的“拼写检查”。

如果你觉得目前的 AI 工具配置太重，或者你更偏爱在命令行里解决问题，不妨试试 OpenCode，去 GitHub 贡献个 star 也是极好的~~

如果对文章有任何疑问，欢迎评论留言讨论~~



如果觉得文章对您有帮助，欢迎关注、一键三连~~
