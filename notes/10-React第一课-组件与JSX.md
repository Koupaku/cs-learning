# React 第一课：组件与 JSX 🧱

> 配套项目：`react-weather/`（运行：终端 `npm run dev` → 打开 http://127.0.0.1:5173/） //npm run dev -- --host 127.0.0.1
> 本课目标：理解"组件 + JSX"，把练习 06 的名片用 React 写一遍

---

## 0. 思维转变：命令式 → 声明式（本课最重要！）

**你以前的写法（命令式，练习 03 待办清单）**：
```js
function render() {
  todoList.innerHTML = '';                    // ① 亲自动手清空
  todos.forEach(todo => {                     // ② 亲自动手造 <li>
    const li = document.createElement('li');
    li.textContent = todo.text;
    todoList.appendChild(li);                 // ③ 亲自动手挂上去
  });
}
// 每次数据变，你都要手动调用 render() 重画
```

**React 的写法（声明式）**：
```jsx
function App() {
  const todos = ['买牛奶', '写作业'];         // 数据
  return (                                    // 只"描述"页面长什么样
    <ul>
      {todos.map(todo => <li>{todo}</li>)}    // 不需要管"怎么画"
    </ul>
  );
}
// 数据一变，React 自己重画，你不用写 render()、不用管 innerHTML
```

**记忆法**：
- 命令式 = 你当"施工队长"：每一步都亲自指挥（清空！创建！挂上！）
- 声明式 = 你当"设计师"：只画设计图（长这样），React 当施工队自动盖楼

练习 03 你亲手写了 6 遍 render()——现在 React 帮你把它干了。

---

## 1. 你的页面是怎么跑起来的（三条连线）

```
index.html            src/main.jsx            src/App.jsx
┌─────────────┐       ┌──────────────────┐    ┌───────────────────┐
│ <div id="root">│ ←── │ createRoot(...).render(<App />) │ ←─ import App
└─────────────┘       └──────────────────┘    └───────────────────┘
   空的挂载点              入口：把 App 渲染进 #root     你的组件（主战场）
```

- `index.html`：全世界唯一的 HTML，只有一个空壳 `<div id="root">`
- `src/main.jsx`：入口，负责把 App 组件"插"进 #root
- `src/App.jsx`：你的主战场——整个页面都由组件组成

**以后你几乎只改 src/ 里的 .jsx 文件，index.html 基本不用碰。**

---

## 2. JSX：写在 JS 里的"HTML"

```jsx
function ProfileCard() {
  const name = 'Koupaku'
  return (
    <div className="card">          {/* 规则2：class 要写成 className */}
      <h1>{name}</h1>                {/* 规则3：JS 表达式要包在 { } 里 */}
      <p>前端开发学习者</p>
    </div>
  )
}
```

**三条规则**：
1. **一个根元素**：return 里最外层只能有一个标签；想并列用碎片 `<>...</>`
2. **`class` → `className`**（因为 class 是 JS 保留字），`for` → `htmlFor`
3. **想在 JSX 里写 JS 值** → 用花括号 `{}`：`{name}`、`{1 + 1}`、`{skills.map(...)}`

> `{/* 注释 */}` 是 JSX 里的注释写法

---

## 3. 组件 = "返回 JSX 的函数"

```jsx
function ProfileCard() {   // 组件就是普通函数
  return <div>...</div>    // 只是必须返回 JSX
}

function App() {
  return <ProfileCard />   // 用 <组件名 /> 来使用它
}
```

**组件名必须大写开头**（`ProfileCard` 不是 `profileCard`）——React 靠大小写分辨"这是组件"还是"原生标签"（`<div>` 小写 = HTML 标签，`<ProfileCard>` 大写 = 你的组件）。

**为什么叫"组件"**：像积木。ProfileCard 是一块积木，以后可以和其他积木（TodoList、WeatherCard...）拼成整个页面——这就是练习 06 名片学过的"卡片"，现在它变成了可以复用的函数。

---

## 4. 动手任务：把欢迎页改成你的名片

**第 1 步**：打开 `src/App.jsx`，**全选删除**，粘贴下面的代码（名字换成你自己的）：

```jsx
// src/App.jsx —— 你的第一个组件
import './App.css'

const skills = ['JavaScript', 'HTML/CSS', 'React 学习中']

function ProfileCard() {
  const name = 'Koupaku'          // ← 换成你的名字

  return (
    <div className="card">
      <div className="avatar">👨‍💻</div>
      <h1>{name}</h1>
      <p>前端开发学习者</p>
      <div className="tags">
        {skills.map((skill) => (
          <span className="tag" key={skill}>{skill}</span>
        ))}
      </div>
    </div>
  )
}

function App() {
  return <ProfileCard />
}

export default App
```

**第 2 步**：打开 `src/App.css`，全选删除，粘贴名片样式（练习 06 你写过的 CSS）：

```css
/* src/App.css */
* { box-sizing: border-box; }

body {
  font-family: "Microsoft YaHei", sans-serif;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f6ff;
}

.card {
  background: white;
  padding: 32px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 360px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: aquamarine;
  font-size: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.tags { display: flex; justify-content: center; gap: 8px; margin-top: 16px; }
.tag {
  background: #eee;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  color: #555;
}
```

**第 3 步**：保存 → 看浏览器自动刷新（HMR 热更新！比 Live Server 还快）→ 名片出现 🎉

**第 4 步（体会声明式）**：把 `const name = 'Koupaku'` 改成你的中文名 → 保存 → 页面**自己**变了，你什么都没指挥。

---

## 5. 常见报错速查（先预防）

| 报错 | 原因 |
|------|------|
| `Component definition is missing display name` | 组件名小写了？必须大写开头 |
| `Adjacent JSX elements must be wrapped in an enclosing tag` | return 里有两个根标签 → 用 `<>...</>` 包起来 |
| `'X' is not defined` | 用了没定义的变量/组件 → 检查 import 和拼写 |
| `Each child in a list should have a unique "key" prop`（警告） | map 渲染忘了 `key`（第 4 步示例里已加） |

## 预习（下节课讲）
- `skills` 数组写在组件外面、`name` 写在里面——为什么？→ **props 和 state**
- 那个 `key={skill}` 是什么？→ React 给列表元素的"身份证"
