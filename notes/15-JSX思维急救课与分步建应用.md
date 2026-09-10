# JSX 思维急救课：两个区 + 分步建应用 🚑

> 给卡住的你：这一课不讲新东西，只把"JSX 里怎么编程"这件事讲透，
> 然后用**六个小步**把待办清单重新建起来——每步都能跑、都能看到结果。

---

## 一、核心困惑：JSX 里到底怎么"编程"？

**答案：JSX 里不编程，JSX 里只"放值"。**

记住这张图——每个组件函数里都有**两个区**：

```jsx
function TodoApp() {
  // ┌─────────────────────────────────────────┐
  // │ 【逻辑区】return 之前                     │
  // │ 普通 JS，爱怎么写怎么写：                  │
  // │   - 变量 const name = 'x'                │
  // │   - if / for / 函数 / 数组方法            │
  // │   - useState(...)                        │
  // └─────────────────────────────────────────┘
  const [todos, setTodos] = useState([])
  const leftCount = todos.filter(t => !t.done).length   // 先算好

  // ┌─────────────────────────────────────────┐
  // │ 【视图区】return 的 JSX                   │
  // │ 只描述"页面长什么样"，{} 里只放"值"：      │
  // │   - 变量 {name}                          │
  // │   - 函数调用 {name.toUpperCase()}         │
  // │   - 三元 {isVip ? 'A' : 'B'}              │
  // │   - map 渲染列表 {arr.map(...)}           │
  // └─────────────────────────────────────────┘
  return (
    <div>
      <p>{leftCount} 件未完成</p>
    </div>
  )
}
```

### 为什么 `{}` 里不能写 if / for？

因为 JSX 最后会被"翻译"成**函数调用**，而函数调用只能接收**值**，不能接收"语句"（if、for 是语句，不是值）。

- ❌ `{if (x) { ... }}` → if 是语句，不是值
- ✅ `{x ? 'A' : 'B'}` → 三元是表达式，结果是值
- ✅ 复杂的 if 逻辑 → **搬到逻辑区**用 if 算好一个变量，JSX 里只放那个变量

**一句话**：**"算"在逻辑区，"摆"在视图区，中间靠 `{}` 递东西。**

---

## 二、把"函数"清点一遍（你说想从头理解函数）

React 组件里出现的函数只有四类，各司其职：

| 函数 | 谁调用它？ | 什么时候跑？ | 里面写什么 |
|------|-----------|-------------|-----------|
| **组件函数** `function TodoApp()` | **React** | 每次渲染（首次 + 每次 state 变） | 逻辑 + `return` JSX |
| **事件处理函数** `function addTodo()` | 浏览器（用户点击时） | 点击那一瞬间 | 改 state（setTodos） |
| **数组回调** `todos.map((t) => ...)` | map/filter 自己 | 每次渲染时 | 返回一个值/一段 JSX |
| **Hook** `useState(0)` | **你**调用 | 每次渲染时 | （React 提供的工具，不是我们写的） |

### 最关键的心智模型（请读三遍）

> **组件函数不是"运行一次就完"，而是 React 每次需要重画页面时，都会重新调用它一遍。**
>
> 所以：
> - 函数里 `const leftCount = ...` 这种"临时算的东西"，**每次重画都会重新算一遍** → 永远是最新的
> - `useState` 里的值**跨重画被 React 记住** → 这就是它和普通变量的区别
> - `setTodos(新值)` 的作用是 **"告诉 React：数据变了，请再调用我一次"**

**这解释了为什么不用写 render()**——组件函数本身就是那个 render！

---

## 三、分步建应用：六小步（每步都跑一次！）

> 原则：**每一步都只加一点点，加完立刻刷新验证**。不要一次写完整个应用。
> 每步代码都可以直接抄，但请**亲手敲**——这一轮的目标是"建立手感"，不是"独立完成"。

### 第 1 步：先让页面出现三条"死"数据（不涉及 state）

新建 `src/components/TodoApp.jsx`：

```jsx
function TodoApp() {
  // 逻辑区：先写死三条数据（还没用 state）
  const todos = [
    { id: 1, text: '买牛奶', done: false },
    { id: 2, text: '写作业', done: true },
    { id: 3, text: '练 React', done: false },
  ]

  // 视图区：把数组渲染成列表
  return (
    <div className="todo-app">
      <h1>📝 待办清单</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span>{todo.text}</span>
            <span>{todo.done ? '✅ 已完成' : '⬜ 未完成'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoApp
```

`App.jsx` 改成：

```jsx
import './App.css'
import TodoApp from './components/TodoApp.jsx'

function App() {
  return <TodoApp />
}

export default App
```

**验证**：刷新页面，看到三条待办。
**这一步的意义**：先确认"数组 → map → JSX 列表"这条链通了。**这就是 JSX 编程的核心动作**，你练习 01 的 map 在这里复活了。

---

### 第 2 步：把死数据变成 state

只改一行：把 `const todos = [...]` 换成 `useState`：

```jsx
import { useState } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: '买牛奶', done: false },
    { id: 2, text: '写作业', done: true },
    { id: 3, text: '练 React', done: false },
  ])
  // ...（return 部分不动）
```

**验证**：页面看起来一样。
**这一步的意义**：页面没变，但数据"活"了——现在它躺在 React 的记忆里，可以被修改并触发重画。

---

### 第 3 步：加输入框（受控组件）

逻辑区加一个 state，视图区加输入框**和三个调试按钮**（先用假动作验证 state 通不通）：

```jsx
  const [input, setInput] = useState('')     // ← 逻辑区新增
```

```jsx
  return (
    <div className="todo-app">
      <h1>📝 待办清单</h1>

      {/* 视图区：输入框 + 按钮 */}
      <div className="input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="要做什么？"
        />
        {/* 调试按钮：只显示当前 state，不做别的 */}
        <button onClick={() => alert(input)}>测试输入</button>
      </div>

      <ul>
        {/* 列表部分不动 */}
```

**验证**：输入文字 → 点"测试输入" → 弹出你输入的内容。
**这一步的意义**：确认"输入框 ↔ state"双向通了。**这是受控组件的全部秘密**，先单独验证，再往下走。

---

### 第 4 步：真的添加（把输入推进数组）

```jsx
  // 逻辑区新增：事件处理函数
  function addTodo() {
    if (input.trim() === '') return          // 空的不加
    setTodos([...todos, { id: Date.now(), text: input, done: false }])
    setInput('')                              // 清空输入框
  }
```

视图区把调试按钮换成：

```jsx
        <button onClick={addTodo}>添加</button>
```

**验证**：输入"测试"→ 点添加 → 列表多一条，输入框清空。
**这一步的意义**：第一次体验"改 state → 页面自动更新"，而且**没碰任何 DOM**。

---

### 第 5 步：删除

```jsx
  // 逻辑区
  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id))
  }
```

视图区每条加删除按钮：

```jsx
          <li key={todo.id}>
            <span>{todo.text}</span>
            <span>{todo.done ? '✅' : '⬜'}</span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
```

**验证**：点删除能删掉对应那条。
**注意**：`onClick={() => deleteTodo(todo.id)}` 里的箭头函数是**闭包**（练习 03 学过）——它记住了"是哪一条"。

---

### 第 6 步：完成切换 + 统计

```jsx
  // 逻辑区
  function toggleDone(id) {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ))
  }

  const leftCount = todos.filter((todo) => !todo.done).length   // 先算好，视图区直接用
```

视图区：

```jsx
          <li key={todo.id} className={todo.done ? 'done' : ''}>
            <button onClick={() => toggleDone(todo.id)}>✓</button>
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
```

列表后面加：

```jsx
      <p className="stats">还剩 {leftCount} 件未完成</p>
```

**验证**：点 ✓ 划线、点删除消失、统计数字跟着变。
**对比**：这一行 `{leftCount}` 就是"逻辑区算好，视图区摆放"的标准姿势。

---

## 四、CSS

`App.css` 追加（讲义 `13-React第四课-待办清单.md` 第 4 节有完整样式，直接抄）。

---

## 五、如果六步走完还是晕，就只做这一件事

**把第 1 步的代码删掉一半，看报错；再加回来，看恢复。**
比如把 `todos.map(...)` 换成 `todos`（直接放数组）→ 页面报错提示你不能把对象当子元素渲染。
**这种"故意破坏 + 观察"是理解 JSX 最快的方式**——比读十遍教程都快。

## 六、记住这句话就够了

> **逻辑区负责"算"，视图区负责"摆"，`{}` 是把算好的值递过去的手。**
