/**
 * preload.js
 * 预加载脚本，用于安全地暴露主进程功能给渲染进程
 * 同时处理数据库的初始化和操作
 */

// 所有的 Node.js API接口 都可以在 preload 进程中被调用.
// 它拥有与Chrome扩展一样的沙盒。
const { contextBridge, ipcRenderer } = require('electron')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { app } = require('@electron/remote')

// 数据库配置
const DB_CONFIG = {
    filename: path.join(app.getPath('userData'), 'todos.db'),
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
}

// 打印数据库路径信息
console.log('User Data Path:', app.getPath('userData'))
console.log('Database Path:', DB_CONFIG.filename)

// 数据库连接实例
let db = null

/**
 * 初始化数据库
 * 创建数据库连接并设置表结构
 * @returns {Promise} 返回初始化完成的Promise
 */
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        console.log('Initializing database at:', DB_CONFIG.filename)

        db = new sqlite3.Database(
            DB_CONFIG.filename,
            DB_CONFIG.mode,
            async (err) => {
                if (err) {
                    console.error('Database connection error:', err.message)
                    reject(err)
                    return
                }
                
                try {
                    // 使用事务确保表结构的原子性创建
                    await runQuery('BEGIN TRANSACTION')
                    
                    // 创建待办事项表
                    await runQuery(`
                        CREATE TABLE IF NOT EXISTS todos (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            text TEXT NOT NULL,
                            completed INTEGER DEFAULT 0,
                            due_date TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `)
                    
                    await runQuery('COMMIT')
                    console.log('Database initialized successfully')
                    resolve()
                } catch (error) {
                    await runQuery('ROLLBACK')
                    console.error('Database initialization error:', error)
                    reject(error)
                }
            }
        )
    })
}

/**
 * 执行SQL查询的辅助函数
 * @param {string} sql SQL查询语句
 * @param {Array} params 查询参数
 * @returns {Promise} 返回查询结果
 */
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err)
            else resolve(this)
        })
    })
}

// 初始化数据库
initializeDatabase().catch(console.error)

// 数据库操作函数集合
const dbOperations = {
    /**
     * 获取所有待办事项
     * 按日期和创建时间排序
     */
    getAllTodos: () => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'))
                return
            }

            const query = `
                SELECT *, 
                    CASE 
                        WHEN due_date IS NULL THEN 1 
                        WHEN date(due_date) < date('now') THEN 0
                        ELSE 0.5 
                    END as date_order
                FROM todos 
                ORDER BY date_order ASC, 
                    CASE WHEN due_date IS NULL THEN created_at ELSE due_date END ASC,
                    created_at DESC
            `
            
            db.all(query, [], (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    },

    /**
     * 获取指定日期的待办事项
     * @param {string} date 日期字符串 (YYYY-MM-DD)
     */
    getTodosByDate: (date) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'))
                return
            }

            const query = `
                SELECT * FROM todos 
                WHERE (date(due_date) = date(?) OR (? IS NULL AND due_date IS NULL))
                ORDER BY created_at DESC
            `
            
            db.all(query, [date, date], (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    },

    /**
     * 添加新的待办事项
     * @param {string} text 待办事项内容
     * @param {string} dueDate 截止日期 (可选)
     */
    addTodo: (text, dueDate) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'))
                return
            }

            const params = [text, dueDate || null]
            db.run('INSERT INTO todos (text, due_date) VALUES (?, ?)', params, function(err) {
                if (err) reject(err)
                else resolve(this.lastID)
            })
        })
    },

    /**
     * 切换待办事项的完成状态
     * @param {number} id 待办事项ID
     */
    toggleTodo: (id) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'))
                return
            }

            db.run(
                'UPDATE todos SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END WHERE id = ?',
                [id],
                (err) => {
                    if (err) reject(err)
                    else resolve()
                }
            )
        })
    },

    /**
     * 删除待办事项
     * @param {number} id 待办事项ID
     */
    deleteTodo: (id) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'))
                return
            }

            db.run('DELETE FROM todos WHERE id = ?', [id], (err) => {
                if (err) reject(err)
                else resolve()
            })
        })
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  })

// 暴露API给渲染进程
contextBridge.exposeInMainWorld(
    'electron', {
        // 窗口控制操作
        minimizeWindow: () => ipcRenderer.send('minimize-window'),
        maximizeWindow: () => ipcRenderer.send('maximize-window'),
        closeWindow: () => ipcRenderer.send('close-window'),
        // 数据库操作
        todos: {
            getAll: () => dbOperations.getAllTodos(),
            getByDate: (date) => dbOperations.getTodosByDate(date),
            add: (text, dueDate) => dbOperations.addTodo(text, dueDate),
            toggle: (id) => dbOperations.toggleTodo(id),
            delete: (id) => dbOperations.deleteTodo(id)
        }
    }
)

// 数据库连接清理
process.on('exit', () => {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message)
            }
        })
    }
})