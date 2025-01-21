// 窗口控制
document.getElementById('minimize-btn').addEventListener('click', () => {
    window.api.window.minimize();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
    window.api.window.maximize();
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.api.window.close();
});

// Get DOM elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todayTodos = document.getElementById('today-todos');
const todoDate = document.getElementById('todo-date');

// 过滤按钮
const filterButtons = {
    all: document.getElementById('filter-all'),
    active: document.getElementById('filter-active'),
    completed: document.getElementById('filter-completed')
};

const dateFilterButtons = {
    all: document.getElementById('date-filter-all'),
    today: document.getElementById('date-filter-today'),
    tomorrow: document.getElementById('date-filter-tomorrow'),
    future: document.getElementById('date-filter-future'),
    nodate: document.getElementById('date-filter-nodate')
};

// 当前过滤状态
let currentFilter = 'all';
let currentDateFilter = 'all';

// 更新过滤按钮状态
function updateFilterButtons() {
    Object.keys(filterButtons).forEach(key => {
        filterButtons[key].classList.toggle('active', key === currentFilter);
    });
    Object.keys(dateFilterButtons).forEach(key => {
        dateFilterButtons[key].classList.toggle('active', key === currentDateFilter);
    });
}

// 添加过滤按钮事件监听
Object.keys(filterButtons).forEach(key => {
    filterButtons[key].addEventListener('click', () => {
        currentFilter = key;
        updateFilterButtons();
        renderTodos();
    });
});

// 添加日期过滤按钮事件监听
Object.keys(dateFilterButtons).forEach(key => {
    dateFilterButtons[key].addEventListener('click', () => {
        currentDateFilter = key;
        updateFilterButtons();
        renderTodos();
    });
});

// 初始化日期选择器
const datePicker = flatpickr(todoDate, {
    dateFormat: "Y-m-d",
    locale: {
        firstDayOfWeek: 1
    },
    allowInput: true,
    clearButton: true,
    placeholder: "选择日期（可选）"
});

// 初始化日历
const calendar = flatpickr("#calendar", {
    inline: true,
    dateFormat: "Y-m-d",
    defaultDate: new Date(),
    locale: {
        firstDayOfWeek: 1
    },
    onChange: function(selectedDates) {
        if (selectedDates.length > 0) {
            renderTodosByDate(selectedDates[0]);
        }
    }
});

// 格式化日期
function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期显示
function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 格式化为 yyyy-MM-dd 格式
    const formattedDate = formatDate(date);
    
    // 如果是今天或明天，显示特殊文本
    if (formatDate(today) === formattedDate) {
        return '今天';
    } else if (formatDate(tomorrow) === formattedDate) {
        return '明天';
    }
    
    // 否则显示具体日期
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 更新统计信息
function updateStatistics(todos) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    document.getElementById('total-count').textContent = total;
    document.getElementById('completed-count').textContent = completed;
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('todo-count').textContent = `共 ${total} 项`;
}

// 渲染指定日期的待办事项
async function renderTodosByDate(date) {
    try {
        const formattedDate = formatDate(date);
        const todos = await window.api.todos.getByDate(formattedDate);
        todayTodos.innerHTML = '';
        
        document.getElementById('today-count').textContent = `共 ${todos.length} 项`;
        
        if (todos.length === 0) {
            todayTodos.innerHTML = '<div class="text-muted text-center py-3">没有待办事项</div>';
            return;
        }

        todos.forEach((todo) => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox form-check-input" 
                       ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn">&times;</button>
            `;

            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            const deleteBtn = todoItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            todayTodos.appendChild(todoItem);
        });
    } catch (error) {
        console.error('Error rendering todos by date:', error);
    }
}

// 过滤待办事项
function filterTodos(todos) {
    // 首先按完成状态过滤
    let filteredTodos = todos;
    switch (currentFilter) {
        case 'active':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
    }

    // 然后按日期过滤
    const today = formatDate(new Date());
    const tomorrow = formatDate(new Date(Date.now() + 86400000)); // 明天

    switch (currentDateFilter) {
        case 'today':
            return filteredTodos.filter(todo => formatDate(todo.due_date) === today);
        case 'tomorrow':
            return filteredTodos.filter(todo => formatDate(todo.due_date) === tomorrow);
        case 'future':
            return filteredTodos.filter(todo => {
                const dueDate = formatDate(todo.due_date);
                return dueDate && dueDate > tomorrow;
            });
        case 'nodate':
            return filteredTodos.filter(todo => !todo.due_date);
        default:
            return filteredTodos;
    }
}

// Render all todos
async function renderTodos() {
    try {
        const todos = await window.api.todos.getAll();
        const filteredTodos = filterTodos(todos);
        todoList.innerHTML = '';
        
        updateStatistics(todos);
        updateFilterButtons();
        
        if (filteredTodos.length === 0) {
            todoList.innerHTML = '<div class="text-muted text-center py-3">没有待办事项</div>';
            return;
        }

        filteredTodos.forEach((todo) => {
            const todoItem = document.createElement('div');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox form-check-input" 
                       ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                ${todo.due_date ? `<span class="todo-date">${formatDateDisplay(todo.due_date)}</span>` : ''}
                <button class="delete-btn">&times;</button>
            `;

            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            const deleteBtn = todoItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(todoItem);
        });

        // 更新今日待办
        renderTodosByDate(new Date());
    } catch (error) {
        console.error('Error rendering todos:', error);
    }
}

// Add new todo
async function addTodo(text, dueDate) {
    try {
        await window.api.todos.add(text, dueDate);
        renderTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

// Toggle todo completion
async function toggleTodo(id) {
    try {
        await window.api.todos.toggle(id);
        renderTodos();
    } catch (error) {
        console.error('Error toggling todo:', error);
    }
}

// Delete todo
async function deleteTodo(id) {
    try {
        await window.api.todos.delete(id);
        renderTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
    }
}

// Form submit handler
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    const dueDate = todoDate.value;
    if (text) {
        await addTodo(text, dueDate);
        todoInput.value = '';
        datePicker.clear();
    }
});

// 在文档加载完成后执行
document.addEventListener('DOMContentLoaded', async () => {
    // 显示数据库路径
    console.log('Database location:', await window.api.getDbPath())
    
    // ... existing code ...
});

// 延迟初始化
setTimeout(() => {
    renderTodos();
}, 500); 