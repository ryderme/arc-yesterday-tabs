# Arc Yesterday's Tabs

Arc Yesterday's Tabs 是一个 Chrome 扩展插件，专为 Arc 浏览器设计。它可以帮助用户一键重新打开昨天自动关闭的所有网页标签。

## 功能特点

- 记录并跟踪关闭的标签页
- 获取过去24小时内的浏览历史
- 一键重新打开昨天关闭的标签页
- 避免重复打开已经打开的标签页

## 安装

1. 克隆此仓库或下载源代码
2. 运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建项目
4. 在 Chrome 浏览器中打开 `chrome://extensions/`
5. 启用"开发者模式"
6. 点击"加载已解压的扩展程序"，选择项目的 `dist` 目录

## 使用方法

1. 点击浏览器工具栏中的扩展图标
2. 在弹出的窗口中，点击"重新打开昨天的标签页"按钮
3. 插件将自动打开昨天关闭的标签页

## 开发

- `src/background.ts`: 后台脚本，处理标签页的跟踪和重新打开逻辑
- `src/popup.ts`: 弹出窗口脚本，处理用户界面交互
- `src/popup.html`: 弹出窗口的 HTML 结构
- `src/styles.css`: 弹出窗口的样式表

## 构建

运行以下命令之一来构建项目：

- `npm run build`: 用于开发环境，保留所有控制台输出。这将编译 TypeScript 文件，复制必要的资源文件，并将输出放在 `dist` 目录中。
- `npm run build:prod`: 用于生产环境，移除所有控制台输出和调试器语句。这将编译 TypeScript 文件，压缩 JavaScript 代码，复制必要的资源文件，并将输出放在 `dist` 目录中。

## 技术栈

- TypeScript
- Chrome Extension API
- HTML/CSS

## 贡献

欢迎提交问题和拉取请求。对于重大更改，请先开启一个问题讨论您想要改变的内容。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
