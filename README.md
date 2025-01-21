# TODO Application

A modern todo application built with Vue 3 and Electron, featuring both desktop and web versions.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Vue](https://img.shields.io/badge/vue-3.4.0-brightgreen.svg)
![Electron](https://img.shields.io/badge/electron-34.0.0-blue.svg)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3.3-purple.svg)

[English](README.md) | [中文](README_zh.md)

## Overview

TODO is a modern task management application that combines the power of Vue 3 and Electron to provide both web and desktop experiences. It's designed to be simple, efficient, and user-friendly while maintaining a clean and modern interface.

### Key Features

- 📝 Create, read, update, and delete todos
- 📅 Date-based task organization
- ✅ Task completion tracking
- 🔍 Filter tasks by status and date
- 💾 Local storage persistence
- 🖥️ Cross-platform desktop application
- 🌐 Web version available
- 🎨 Modern and responsive UI
- 🚀 Fast and lightweight

### Screenshots

[Add your application screenshots here]

## Quick Start

### Web Version

```bash
# Clone the repository
git clone https://github.com/wzb1024/todo.git

# Navigate to project directory
cd todo

# Install dependencies
npm install

# Start development server
npm run dev

# Or run with Docker
docker build -t todo .
docker run -d -p 8080:80 --name todo todo
```

Visit http://localhost:8080 (or http://localhost:5173 for dev server)

### Desktop Version

```bash
# Development mode
npm run dev:electron

# Production build
npm run start:prod
```

## Technology Stack

### Frontend
- **Framework:** Vue 3
- **Build Tool:** Vite
- **UI Framework:** Bootstrap 5
- **Date Picker:** Flatpickr
- **State Management:** Vue Composition API

### Backend (Desktop Version)
- **Runtime:** Electron
- **Database:** SQLite3
- **IPC:** Electron IPC

### Deployment
- **Container:** Docker + Nginx
- **Build:** Multi-stage Docker build
- **Package:** Electron Forge

## Development Guide

### Project Structure
```
todo/
├── src/                    # Source files
│   ├── assets/            # Static assets
│   ├── components/        # Vue components
│   └── App.vue            # Root component
├── public/                # Public static files
├── index.html             # HTML entry point
├── index.js               # Electron main process
├── preload.js             # Electron preload script
├── vite.config.js         # Vite configuration
├── package.json           # Project metadata
├── Dockerfile            # Docker configuration
└── nginx.conf            # Nginx configuration
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run dev:electron` | Start Electron development |
| `npm run start:prod` | Run production Electron app |
| `npm run package` | Package the application |
| `npm run make` | Create platform-specific builds |

### Environment Requirements

- Node.js >= 18
- npm >= 8
- Docker (optional, for web version)

## Deployment

### Web Version
1. Build the Docker image:
   ```bash
   docker build -t todo .
   ```

2. Run the container:
   ```bash
   docker run -d -p 8080:80 --name todo todo
   ```

### Desktop Version
1. Package the application:
   ```bash
   npm run package
   ```

2. Create installers:
   ```bash
   npm run make
   ```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request


## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Vue.js Team
- Electron Team
- Bootstrap Team
- All contributors

## Support

If you have any questions or need help, you can:
- Open an [issue](https://github.com/wzb1024/todo/issues)
- Contact the author directly
- Check the [documentation](docs/) 