// 练习 08：待办清单 v2（React 预备课）
// 升级点：① 点"完成"标记划线 ② 统计还剩几件 ③ 全程坚持"不可变性"
// 打样：notes/08-展开与不可变性打样/（先跑通它！）
// 建议：把练习 03 的 app.js 打开对照，v1 的部分直接搬

// ===== 抓元素 =====
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const stats = document.getElementById('stats');

// ===== 数据 =====
let todos = [];   // { id, text, done }

// ===== 渲染（v1 的基础上改造） =====
function render() {
  todoList.innerHTML = '';
  todos.forEach((todo) => {
    const li = document.createElement('li');
    if (todo.done) {
      li.className = 'done';        // 已完成 → 贴 done 标签（CSS 负责划线）
    }

    // 完成按钮（新！点它 → toggleDone）
    const doneBtn = document.createElement('button');
    doneBtn.textContent = todo.done ? '↩ 恢复' : '✓ 完成';
    doneBtn.className = 'btn-done';
    doneBtn.addEventListener('click', () => toggleDone(todo.id));
    li.appendChild(doneBtn);

    // 文字
    const span = document.createElement('span');
    span.textContent = todo.text;
    li.appendChild(span);

    // 删除按钮（v1 就有）
    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.className = 'btn-del';
    delBtn.addEventListener('click', () => deleteTodo(todo.id));
    li.appendChild(delBtn);

    todoList.appendChild(li);
  });

  // TODO 2: 更新统计（还剩几件未完成）
  // 提示：const left = todos.filter(todo => !todo.done).length;
  //       stats.textContent = `还剩 ${left} 件未完成`;
  const left = todos.filter(todo => !todo.done).length;
  stats.textContent = `还剩${left} 件未完成`;
}

// ===== 添加（v1 直接搬） =====
function addTodo() {
  const text = todoInput.value.trim();
  if (text === '') {
    alert('不能添加空的待办！');
    return;
  }
  todos = [...todos, { id: Date.now(), text, done: false }];  // ★ v2 升级：展开运算符添加
  todoInput.value = '';
  render();
}

// ===== 删除（v1 直接搬） =====
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  render();
}


// ===== TODO 1: 切换完成状态（本课重点！） =====
function toggleDone(id) {
  // 用 map 遍历：命中的那条 → 照抄一份并翻转 done（不可变性！）
  // 没命中的 → 原样返回
  // 提示：todos = todos.map(todo =>
  //         todo.id === id ? { ...todo, done: !todo.done } : todo
  //       );
  // 然后 render()
  todos = todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo );
  render();
} 

// ===== 绑定事件 =====
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addTodo();
});

render();
