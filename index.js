/**
 * index.js
 * Electron 主进程文件
 * 负责应用程序的生命周期管理和原生窗口创建
 */

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
require('@electron/remote/main').initialize()

const isDev = process.env.NODE_ENV === 'development'

// 窗口配置
const WINDOW_CONFIG = {
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, 'preload.js')
    }
}

// 保存主窗口的引用
let mainWindow = null

/**
 * 创建主窗口
 * 设置窗口属性和事件处理
 */
const createWindow = async () => {
    // Create the browser window.
    mainWindow = new BrowserWindow(WINDOW_CONFIG)
    
    // Enable remote module
    require('@electron/remote/main').enable(mainWindow.webContents)

    try {
        // In development, use Vite's dev server
        if (isDev) {
            // Wait for Vite dev server to start
            await new Promise(resolve => setTimeout(resolve, 2000))
            await mainWindow.loadURL('http://localhost:5173')
            mainWindow.webContents.openDevTools()
        } else {
            // In production, load the built files
            const indexPath = path.join(__dirname, 'dist', 'index.html')
            console.log('Loading production file from:', indexPath)
            
            try {
                await mainWindow.loadFile(indexPath)
            } catch (loadError) {
                console.error('Failed to load index.html:', loadError)
                // Try loading with file protocol
                await mainWindow.loadURL(`file://${indexPath}`)
            }
        }
    } catch (error) {
        console.error('Failed to load app:', error)
        app.quit()
    }

    // Enable DevTools in production for debugging if needed
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.control && input.shift && input.key.toLowerCase() === 'i') {
            mainWindow.webContents.openDevTools()
            event.preventDefault()
        }
    })

    // Handle window errors
    mainWindow.webContents.on('crashed', () => {
        console.error('Window crashed!')
    })

    mainWindow.on('unresponsive', () => {
        console.error('Window became unresponsive!')
    })

    // Window control
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize()
    })

    ipcMain.on('maximize-window', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    })

    ipcMain.on('close-window', () => {
        mainWindow.close()
    })
}

// This method will be called when Electron has finished initialization
app.whenReady()
    .then(() => {
        process.env.ELECTRON = "true"
        createWindow()
    })
    .catch((error) => {
        console.error('Error during initialization:', error)
    })

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 在当前文件中你可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。