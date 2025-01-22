/**
 * preload.js
 * 预加载脚本，用于安全地暴露主进程功能给渲染进程
 * 同时处理数据库的初始化和操作
 */

// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
const { contextBridge, ipcRenderer } = require('electron')
const sqlite3 = require('sqlite3')
const { open } = require('sqlite')
const path = require('path')
const { app } = require('@electron/remote')

let db = null

// 初始化数据库
const initDatabase = async () => {
  const dbPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, 'todos.db')
    : path.join(app.getPath('userData'), 'todos.db')

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    })

    await db.exec(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      date TEXT,
      completed INTEGER DEFAULT 0
    )`)
  } catch (err) {
    console.error('Database initialization error:', err)
  }
}

(async () => {
  await initDatabase()
})()

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('api', {
  // 数据库操作
  todos: {
    getAll: async () => {
      if (!db) {
        throw new Error('Database not initialized')
      }
      return db.all('SELECT * FROM todos ORDER BY date IS NULL, date ASC, id DESC')
    },

    add: async (text, date) => {
      if (!db) {
        throw new Error('Database not initialized')
      }
      const result = await db.run(
        'INSERT INTO todos (text, date) VALUES (?, ?)',
        [text, date]
      )
      return result.lastID
    },

    toggle: async (id) => {
      if (!db) {
        throw new Error('Database not initialized')
      }
      await db.run(
        'UPDATE todos SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END WHERE id = ?',
        [id]
      )
    },

    delete: async (id) => {
      if (!db) {
        throw new Error('Database not initialized')
      }
      await db.run('DELETE FROM todos WHERE id = ?', [id])
    }
  },

  // 窗口控制
  window: {
    minimize: () => {
      ipcRenderer.send('window-minimize')
    },
    maximize: () => {
      ipcRenderer.send('window-maximize')
    },
    close: () => {
      ipcRenderer.send('window-close')
    }
  },

  // 获取数据库路径
  getDbPath: () => {
    return process.env.NODE_ENV === 'development'
      ? path.join(__dirname, 'todos.db')
      : path.join(app.getPath('userData'), 'todos.db')
  }
})

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

// 数据库连接清理
process.on('exit', async () => {
    if (db) {
        try {
            await db.close()
        } catch (err) {
            console.error('Error closing database:', err.message)
        }
    }
})