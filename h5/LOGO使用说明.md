# 图标/Logo 显示功能说明

## 功能概述
图表现在支持在每个柱状条的名称左侧显示图标（可以是公司 Logo、国旗或任何图片）。

## 如何使用

### 方法一：使用默认配置（已配置好）
直接刷新页面，默认的 `config.json` 已经为主要科技公司配置了 Logo：
- 苹果 (Apple)
- 谷歌 (Google)
- 微软 (Microsoft)
- 亚马逊 (Amazon)
- Meta
- 特斯拉 (Tesla)
- 英伟达 (NVIDIA)
- 腾讯 (Tencent)
- 阿里巴巴 (Alibaba)
- 台积电 (TSMC)

### 方法二：自定义配置

在你的 JSON 配置文件的 `nameMapping` 部分，为任何公司/国家添加 `logo`、`flag` 或 `icon` 字段：

```json
{
  "nameMapping": {
    "苹果": {
      "nameZh": "苹果",
      "nameEn": "Apple",
      "logo": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
    },
    "中国": {
      "nameZh": "中国",
      "nameEn": "China",
      "flag": "https://flagcdn.com/w40/cn.png"
    }
  }
}
```

## 图片来源建议

### 1. 公司 Logo
推荐使用 Wikimedia Commons 的 SVG 格式：
- 搜索：`https://commons.wikimedia.org/wiki/File:[公司名]_logo.svg`
- 优点：高质量、矢量图、免费使用

### 2. 国旗
推荐使用 flagcdn.com：
- 格式：`https://flagcdn.com/w40/[国家代码].png`
- 例如：`https://flagcdn.com/w40/cn.png` (中国)
- 例如：`https://flagcdn.com/w40/us.png` (美国)

### 3. 本地图片
也可以使用本地图片：
```json
"logo": "./images/my-logo.png"
```

## 注意事项

1. **图片格式**：推荐使用 SVG、PNG 格式
2. **图片大小**：图标会自动缩放到 24x24 像素
3. **跨域问题**：确保图片 URL 支持跨域访问（CORS）
4. **可选字段**：如果不配置 logo/flag/icon，该项不会显示图标
5. **字段优先级**：系统会按 `logo` → `flag` → `icon` 的顺序查找

## 效果预览

刷新页面后，你会看到：
```
[Logo图标] 苹果 ████████████ 3,500 $
[Logo图标] 微软 ██████████   3,200 $
[Logo图标] 谷歌 ████████     2,300 $
```

图标会紧贴在公司名称的左侧，随着排名变化平滑移动。
