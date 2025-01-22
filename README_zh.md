# TODO 应用

一个使用 Vue 3 和 Electron 构建的现代化待办事项应用，同时支持桌面端和网页版。

![版本](https://img.shields.io/badge/version-1.0.0-blue.svg)
![许可证](https://img.shields.io/badge/license-ISC-green.svg)
![Vue](https://img.shields.io/badge/vue-3.4.0-brightgreen.svg)
![Electron](https://img.shields.io/badge/electron-34.0.0-blue.svg)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3.3-purple.svg)

[English](README.md) | [中文](README_zh.md)

## 概述

TODO 是一个现代化的任务管理应用，结合了 Vue 3 和 Electron 的优势，提供了桌面端和网页端的使用体验。它的设计理念是简单、高效、用户友好，同时保持清爽现代的界面风格。

### 主要特性

- 📝 创建、读取、更新和删除待办事项
- 📅 基于日期的任务组织
- ✅ 任务完成状态追踪
- 🔍 按状态和日期筛选任务
- 💾 本地存储持久化
- 🖥️ 跨平台桌面应用
- 🌐 网页版支持
- 🎨 现代化响应式界面
- 🚀 快速轻量

### 应用截图

[在此添加应用截图]

## 快速开始

### 网页版

```bash
# 克隆仓库
git clone https://github.com/wzb1024/todo.git

# 进入项目目录
cd todo

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或使用 Docker 运行
docker build -t todo .
docker run -d -p 8080:80 --name todo todo
```

访问 http://localhost:8080 (开发服务器则访问 http://localhost:5173)

### 桌面版

```bash
# 开发模式
npm run dev:electron

# 生产构建
npm run start:prod
```

## 技术栈

### 前端
- **框架：** React 18
- **构建工具：** Vite
- **UI框架：** Bootstrap 5
- **日期选择器：** Flatpickr
- **状态管理：** React Hooks

### 后端（桌面版）
- **运行时：** Electron
- **数据库：** SQLite3
- **进程通信：** Electron IPC

### 部署
- **容器化：** Docker + Nginx
- **构建：** 多阶段 Docker 构建
- **打包：** Electron Forge

## 开发指南

### 项目结构
```
todo/
├── src/                    # 源文件
│   ├── assets/            # 静态资源
│   ├── components/        # Vue 组件
│   └── App.vue            # 根组件
├── public/                # 公共静态文件
├── index.html             # HTML 入口
├── index.js               # Electron 主进程
├── preload.js             # Electron 预加载脚本
├── vite.config.js         # Vite 配置
├── package.json           # 项目元数据
├── Dockerfile            # Docker 配置
└── nginx.conf            # Nginx 配置
```

### 可用脚本

| 命令 | 描述 |
|---------|-------------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run dev:electron` | 启动 Electron 开发环境 |
| `npm run start:prod` | 运行生产版桌面应用 |
| `npm run package` | 打包应用 |
| `npm run make` | 创建特定平台的安装包 |

### 环境要求

- Node.js >= 18
- npm >= 8
- Docker（可选，用于网页版）

## 部署

### 网页版
1. 构建 Docker 镜像：
   ```bash
   docker build -t todo .
   ```

2. 运行容器：
   ```bash
   docker run -d -p 8080:80 --name todo todo
   ```

### 桌面版
1. 打包应用：
   ```bash
   npm run package
   ```

2. 创建安装程序：
   ```bash
   npm run make
   ```

## 参与贡献

我们欢迎各种形式的贡献！详情请查看[贡献指南](CONTRIBUTING.md)。

1. Fork 本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 提交 Pull Request


## 许可证

本项目采用 ISC 许可证 - 详见 [LICENSE](LICENSE) 文件

## 致谢

- Vue.js 团队
- Electron 团队
- Bootstrap 团队
- 所有贡献者

## 支持

如果您有任何问题或需要帮助，您可以：
- 提交 [issue](https://github.com/wzb1024/todo/issues)
- 直接联系作者
- 查看[文档](docs/) 