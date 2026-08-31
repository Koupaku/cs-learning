// ===== 打样：练习03「待办清单」用到的全部新零件 =====
// 使用方法：双击 index.html 用浏览器打开，按 F12 看 Console
// 学习法：每个零件 = 先 console.log 演示 → 再解释 → 最后组装
// 看完这个打样，练习03的 3 个 TODO 你就全会了（但请自己填！）

// ------------------------------------------------------------
// 【零件 0】热身：确认 JS 在跑
// ------------------------------------------------------------
console.log('✅ 打样开始！');

// ------------------------------------------------------------
// 【零件 1】document.getElementById：把页面元素抓进 JS
// ------------------------------------------------------------
const todoInput = document.getElementById('todoInput');  // 抓到输入框（id 要和 html 里一致）
const addBtn = document.getElementById('addBtn');        // 抓到添加按钮
const todoList = document.getElementById('todoList');    // 抓到列表容器 <ul>
console.log('零件1：todoInput 抓到的是：', todoInput);   // Console 里可以点开看这个元素

// ------------------------------------------------------------
// 【零件 2】value + trim：读取输入框内容
// ------------------------------------------------------------
// value  → 输入框里的文字（类型是字符串）
// trim() → 去掉字符串首尾的空格：'  你好  ' → '你好'
todoInput.value = '  先试试  ';                                   // 往输入框里塞点东西（模拟用户输入）
console.log('零件2：原始内容：', JSON.stringify(todoInput.value)); // JSON.stringify 把字符串带引号显示，方便看清空格
console.log('零件2：trim 之后：', JSON.stringify(todoInput.value.trim()));
todoInput.value = '';                                             // 演示完清空输入框

// ------------------------------------------------------------
// 【零件 3】addEventListener：给按钮装"触发器"
// ------------------------------------------------------------
// addEventListener('click', 函数) = 每次按钮被点击，执行这个函数
// 箭头函数 ( ) => { } 就是"点击时要做的事"
addBtn.addEventListener('click', () => {
  console.log('零件3：按钮被点击了！');
});
// 注意：一个元素可以绑多个监听，都会依次触发（后面零件6还会绑一个）

// ------------------------------------------------------------
// 【零件 4】动态创建元素三件套（练习03 TODO 1 的核心）
// ------------------------------------------------------------
// createElement('li') → 凭空造一个 <li>（还没上页面）
// textContent         → 往元素里填文字
// appendChild(li)     → 把造好的元素挂到页面上（变成页面的一部分）
const demoLi = document.createElement('li');   // 造一个 <li>
demoLi.textContent = '我是打样造的 li 元素';    // 填文字
todoList.appendChild(demoLi);                  // 挂上页面
console.log('零件4：页面列表里出现了一行，那就是打样造的');
//console.log('零件4：demoLi 是：', demoLi);
// 去看一眼页面，确认它真的出现了！

// ------------------------------------------------------------
// 【零件 5】数组 + forEach + render：数据驱动页面
// ------------------------------------------------------------
// 核心思想：页面显示什么，完全由数组 todos 决定
// 你只改数组，然后调用 render() 把数组重新画一遍
let todos = [];                               // 数据数组，每个元素是 { id, text, done } 对象
function render() {
  todoList.innerHTML = '';                    // 先把列表清空！否则每次渲染都会重复叠加
  todos.forEach((todo) => {                   // 遍历数组，每条数据造一行
    const li = document.createElement('li');  // 造 <li>
    li.textContent = todo.text;               // 填上这条待办的文字
    todoList.appendChild(li);                 // 挂上页面
  });
  console.log('零件5：渲染完成，当前数据是：', todos);
}
todos.push({ id: 1, text: '测试待办1', done: false });   // 往数组塞两条假数据
todos.push({ id: 2, text: '测试待办2', done: false });
render();                                      // 调用 → 页面出现两行
console.log('零件5：去看页面，出现了两行');

// ------------------------------------------------------------
// 【零件 6】添加待办：push + Date.now（练习03 TODO 2）
// ------------------------------------------------------------
// Date.now() → 当前时间戳（从1970年到现在经过的毫秒数）
//              每次调用都不一样 → 拿它当唯一 id，永远不会重复
function addTodo() {
  const text = todoInput.value.trim();   // 读输入框 + 去掉首尾空格
  if (text === '') {                     // 空内容（或全是空格）不放行
    console.log('零件6：输入是空的，不放行');
    return;                              // return = 立刻结束这个函数，后面的代码不执行
  }
  todos.push({ id: Date.now(), text, done: false });  // 把新待办推进数组（这就是"改数据"）
  todoInput.value = '';                  // 清空输入框，方便输下一条
  render();                              // 改完数据，重新画页面
}
addBtn.addEventListener('click', addTodo);   // 绑上"点击添加"（零件3的监听还在，会先打印那行）

// 按回车也能添加（练习02学过的 keydown，温习一下）：
todoInput.addEventListener('keydown', (event) => {   // event 是浏览器自动传来的"事件情报"
  if (event.key === 'Enter') {                       // 按的是回车键吗？
    addTodo();                                       // 是 → 添加
  }
});

// ------------------------------------------------------------
// 【零件 7】删除：filter + 闭包（练习03 TODO 3，最难的一环）
// ------------------------------------------------------------
// 难点：删除按钮是在 render() 里"动态造"出来的，
//       它怎么知道"我该删哪一条"？
// 答案：在造按钮的那一刻，箭头函数把 todo.id 牢牢"记住"了
//       这个"记住"的能力就叫【闭包】——面试高频考点，现在混个脸熟
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);   // filter：留下 id 不等于要删的
  console.log(`零件7：删掉了 id=${id}，剩余：`, todos);
  render();                                          // 删完重新画
}

// 现在把删除按钮补进 render（这是最终版 render，包含完整功能）：
function renderFinal() {
  todoList.innerHTML = '';                          // 清空
  todos.forEach((todo) => {                         // 遍历
    const li = document.createElement('li');        // 造一行
    li.textContent = todo.text;                     // 填文字

    const delBtn = document.createElement('button');// 再造一个删除按钮
    delBtn.textContent = '删除';
    // ★ 关键：这里把 todo.id 传进 deleteTodo —— 闭包在起作用
    delBtn.addEventListener('click', () => deleteTodo(todo.id));
    li.appendChild(delBtn);                         // 按钮挂到 li 里
    todoList.appendChild(li);                       // li 挂到页面上
  });
}
renderFinal();   // 用最终版渲染（覆盖掉零件5的 render 效果）

// ------------------------------------------------------------
// 【收工】对照一下：练习03的 3 个 TODO 全在这里了
//   TODO 1 渲染列表  → 零件 5 + 零件 7 的 renderFinal
//   TODO 2 添加待办  → 零件 6 的 addTodo
//   TODO 3 删除待办  → 零件 7 的 deleteTodo
// 现在去 exercises/03-todo-list/app.js 自己填一遍！
// 可以打开两个窗口对照，但请一行一行亲手敲，敲一遍才记得住。
// ------------------------------------------------------------
