// 练习 03：待办清单 Todo List
// 任务说明见 README.md

// ========== 第 1 步：抓元素 ==========
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

// ========== 第 2 步：数据（核心思想：数据驱动页面） ==========
// 页面显示什么，完全由这个数组决定——以后学 React，这是最重要的心智模型
let todos = [];   // 每个元素是一个对象：{ id: 唯一编号, text: 内容, done: 是否完成 }

// ========== 第 3 步：把数组"画"到页面上 ==========
function render() {
  // 先把列表清空（否则每次渲染都会重复叠加）
  todoList.innerHTML = '';

  // TODO 1: 用 forEach 遍历 todos，为每一项创建一个 <li> 并放进列表
  // 提示：
  //   todos.forEach(todo => { ... })  —— 对每个 todo 执行一次
  //   创建元素：const li = document.createElement('li');
  //   设置文字：li.textContent = todo.text;
  //   放进页面：todoList.appendChild(li);
  //   给 li 加上删除按钮：见 TODO 2
}

// ========== 第 4 步：添加待办 ==========
function addTodo() {
  // TODO 2: 读取输入框内容，非空才添加
  // 1. const text = todoInput.value; 并去掉首尾空格（.trim()）
  // 2. 如果 text 是空的（''），提示并 return
  // 3. 把 { id: Date.now(), text, done: false } 推进 todos 数组
  //    （Date.now() 返回当前毫秒数，保证每次都不一样 → 用作唯一 id）
  // 4. 清空输入框，调用 render() 刷新页面
}

// ========== 第 5 步：删除一条 ==========
// 注意：删除按钮是在 render() 里动态创建的，怎么让按钮知道"删哪一条"？
// 方法：创建按钮时直接给按钮绑定事件，用闭包记住这一条 todo 的 id
function deleteTodo(id) {
  // TODO 3: 用 filter 把 id 匹配的那一条从 todos 里"筛掉"
  // 提示：todos = todos.filter(todo => todo.id !== id);
  // 然后调用 render() 刷新
}

// ========== 第 6 步：绑定事件 ==========
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// ========== 第 7 步：开局 ==========
render();
