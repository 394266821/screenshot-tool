# 网页截图工具 - 部署指南

## 当前状态

✅ 代码已更新并部署到 GitHub
✅ Vercel 部署应该会自动进行

## 截图方案

本项目使用双重截图方案：

1. **主要方案：ScreenshotOne API**
   - 每月 100 张免费截图
   - 更稳定，功能更丰富
   - 需要配置 API Key

2. **备用方案：Thum.io**
   - 无需 API Key，直接可用
   - 作为自动备用方案

## 配置 ScreenshotOne API（可选但推荐）

1. 访问 https://dash.screenshotone.com/sign-up 注册账号
2. 获取 Access Key
3. 在 Vercel 项目设置中添加环境变量：
   - 名称：`SCREENSHOT_ONE_ACCESS_KEY`
   - 值：你的 Access Key
4. 重新部署项目

## 如果不配置 API Key

不配置 API Key 也能使用，系统会自动使用 Thum.io 作为备用方案。
但 Thum.io 需要在浏览器中打开截图，不如 API 方案方便。

## 测试

部署完成后，访问 https://screenshot-tool-e1771o7on-394266821s-projects.vercel.app 测试截图功能。

## 故障排除

如果截图失败：
1. 检查网络连接
2. 尝试使用备用方案按钮
3. 确认 Vercel 部署是否成功
