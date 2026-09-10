# React 第四课：用 state 做待办清单 📝

> 配套项目：`react-weather/`（改完 Ctrl+R）
> 本课目标：把练习 03 的待办清单升级成 React 版——**你的第一个真正的 React 应用**
> 意义：组件 + props + state + 列表 + 表单，前四课在这里合体

---

## 0. 先看进步：同一个功能，两种写法

**练习 03（原生 JS，命令式）**：抓元素 → 定义 render → 手动 createElement → 手动 appendChild → 每次改数据都调 render()

**React 版（声明式）**：定义 state → 描述 JSX → `setTodos()` 后 React 自动重画

还记得吗？你当初在练习 03 里写过 6 遍 `render()`，还踩过"两个 render 打架"的坑。**React 里根本没有 render() 这个函数**——你不再需要它。

---

## 1. 新知识 A：受控输入（表单怎么接进 state）

以前（原生）：点按钮时读 `input.value`。

React 里我们反过来——**让 state 成为输入框的"真身"**：

```jsx
const [input, setInput] = useState('')

<input
  value={input}                          // ① 显示 state 的值
  onChange={(e) => setInput(e.target.value)}   // ② 用户打字 → 更新 state
/>
```

- `value={input}`：输入框显示什么，由 state 决定
- `onChange`：每次输入都触发，`e.target.value` 是**当前输入框的内容**（`e` 是事件对象，练习 04 的 `event.key` 你用过）
- 这个模式叫**受控组件**（controlled component）：state 是唯一真相，输入框只是它的"显示器"

**面试考点**：为什么用受控组件？—— 数据单一来源，方便实时校验、格式化、联动。

## 2. 新知识 B：数组 state 的三个招式（练习 08 你已经练过！）

```jsx
setTodos([...todos, { id: Date.now(), text, done: false }])   // 添加
setTodos(todos.filter(t => t.id !== id))                       // 删除
setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))  // 修改
```

**和练习 08 一模一样**——只是前面多了 `set`。这就是那节"React 预备课"的价值。

**为什么必须造新数组？** React 靠"值变了"来判断要不要重画。直接 `todos.push(x)` 是改老数组，React 察觉不到 → 页面不动。

## 3. 新知识 C：列表渲染 + key

```jsx
{todos.map((todo) => (
  <li key={todo.id}>{todo.text}</li>
))}
```

- JSX 里用 `{}` 包 JS 表达式，`map` 返回一串 JSX（练习 01 的 map，老朋友）
- **key 必须是唯一且稳定的值**——用 `todo.id`，**不要用数组下标 index**（面试高频追问：为什么不用 index？因为增删后下标会变，React 会认错元素、状态错位）

---

## 4. 动手任务：组装 TodoApp（这次不给完整代码，按提示自己写）

### 第 1 步：新建 `src/components/TodoApp.jsx`

文件骨架（这次要你自己搭，按下面的清单一个个补）：

```
① import useState
② 函数 TodoApp：
   - state 1：todos（数组，初始 []，每条 { id, text, done }）
   - state 2：input（字符串，初始 ''）—— 受控输入用
   - 函数 addTodo()：校验空值 → 添加 → 清空 input
   - 函数 deleteTodo(id)：filter
   - 函数 toggleDone(id)：map + 展开
   - return JSX：
       input（受控）+ 添加按钮
       <ul> 里 map 渲染每条：完成按钮 + 文字 + 删除按钮
       统计"还剩 N 件未完成"
③ export default TodoApp
```

**提示**（不是代码，是思路）：
- addTodo 里的空值校验：`if (input.trim() === '') return`——顺便想想为什么用 `return` 而不是 `alert`（React 里可以用状态显示提示，更优雅；先用 return 就好）
- 已完成的行加个 class：`<li className={todo.done ? 'done' : ''}>`
- 三个函数**都不需要** `render()` 了——改 state 后 React 自动重画

### 第 2 步：`App.jsx` 改成渲染 TodoApp

```jsx
import './App.css'
import TodoApp from './components/TodoApp.jsx'

function App() {
  return <TodoApp />
}

export default App
```

（ProfileCard.jsx 文件留着，Git 里有历史，以后用得上）

### 第 3 步：`App.css` 加待办样式

```css
.todo-app { background: white; padding: 24px; border-radius: 16px; width: 380px; box-shadow: 0 10px 30px rgba(0,0,0,.1); }
.todo-app h1 { margin-top: 0; text-align: center; font-size: 24px; }
.todo-app .input-row { display: flex; gap: 8px; margin-bottom: 16px; }
.todo-app input { flex: 1; padding: 8px 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 15px; }
.todo-app ul { list-style: none; padding: 0; margin: 0; }
.todo-app li { display: flex; align-items: center; gap: 8px; padding: 10px 12px; margin-bottom: 6px; background: #f8f8f8; border-radius: 8px; }
.todo-app li span { flex: 1; }
.todo-app li.done span { text-decoration: line-through; color: #999; }
.todo-app button { border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; background: #4a90d9; color: white; font-size: 13px; }
.todo-app .btn-del { background: #e05d5d; }
.todo-app .stats { color: #999; font-size: 13px; text-align: center; margin: 12px 0 0; }
```

---

## 5. 验收标准

- [ ] 输入文字 → 回车或点添加 → 出现新条目
- [ ] 点 ✓ 完成 → 划线变灰；再点 → 恢复
- [ ] 点删除 → 该条消失
- [ ] 底部显示"还剩 N 件未完成"，数字随操作变化
- [ ] **全程没有 getElementById / createElement / render()**（对照练习 03 感受区别）

## 6. 常见报错

| 报错 | 原因 |
|------|------|
| 输入框打不进字 | `value={input}` 写了但没写 `onChange`（受控组件必须两个都写） |
| 点了添加没反应 | 直接 push 了：`todos.push(...)` → 必须 `setTodos([...todos, ...])` |
| `Warning: Each child in a list should have a unique "key"` | map 里忘了 key |
| `Cannot read properties of undefined` | todo 对象字段拼错（如 `todo.Text`） |

---

## 完成后：给自己一个庆祝

你从练习 03 手写 DOM，到今天用 React 三件套（组件/props/state）重建同一个应用——**这是从"网页脚本"到"应用开发"的分界线**。

```bash
git add .
git commit -m "React第四课：待办清单"
git push
```

下一课：**把天气卡片搬进 React**（useEffect + fetch）——你练习 05 的联网能力，在 React 里重新落地。
