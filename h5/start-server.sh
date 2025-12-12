#!/bin/bash

# D3 赛车柱状图 - 启动服务器脚本

echo "🚀 正在启动本地服务器..."
echo ""
echo "请选择启动方式："
echo "1) Python 3 (推荐)"
echo "2) Node.js (需要安装 serve)"
echo "3) 退出"
echo ""
read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo ""
    echo "✅ 使用 Python 3 启动服务器..."
    echo "📡 服务器地址: http://localhost:8000"
    echo "🌐 请在浏览器中访问: http://localhost:8000/D3-zhuzhuangtu.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
    ;;
  2)
    echo ""
    echo "✅ 使用 Node.js 启动服务器..."
    if command -v serve &> /dev/null; then
      serve
    else
      echo "❌ 未找到 serve 命令"
      echo "请先安装: npm install -g serve"
      exit 1
    fi
    ;;
  3)
    echo "退出"
    exit 0
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac
