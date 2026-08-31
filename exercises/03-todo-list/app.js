// 练习 03：待办清单 Todo List
// 核心思想：数据驱动 —— 页面永远只是 todos 数组的"投影"
// 你只改数组，然后调用 render() 让页面跟着变

// ===== 第 1 步：抓元素 =====
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// ===== 第 2 步：数据 =====
let todos = [];   // 每个元素是一个对象：{ id, text, done }

// ===== 第 3 步：渲染（全文件只有一个 render！） =====
function render() {
  todoList.innerHTML = '';                          // ① 清空旧列表（否则会重复叠加）
  todos.forEach((todo) => {                         // ② 遍历数组，每条数据 → 一行
    const li = document.createElement('li');        // ③ 造 <li>
    li.textContent = todo.text;                     // ④ 填文字

    const delBtn = document.createElement('button');// ⑤ 造删除按钮
    delBtn.textContent = '删除';
    delBtn.addEventListener('click', () => deleteTodo(todo.id)); // ⑥ 闭包：记住"这一条"的 id
    li.appendChild(delBtn);                         // ⑦ 按钮挂进 li

    todoList.appendChild(li);                       // ⑧ li 挂上页面
  });
}

// ===== 第 4 步：添加 =====
function addTodo() {
  const text = todoInput.value.trim();              // 读输入 + 去掉首尾空格
  if (text === '') {                                // 空内容 → 提示 + 退出
    alert('不能添加空的待办！');
    return;
  }
  todos.push({ id: Date.now(), text, done: false }); // 改数据（唯一的数据操作）
  todoInput.value = '';                              // 清空输入框
  render();                                          // 重画页面
}

// ===== 第 5 步：删除 =====
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);    // 筛掉 id 匹配的那条
  render();                                          // 重画页面
}

// ===== 第 6 步：绑定事件 =====
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// ===== 第 7 步：开局 =====
render();
