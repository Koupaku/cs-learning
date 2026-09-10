# React 第三课：state（useState）与事件 ⚡

> 配套项目：`react-weather/`（改完记得 Ctrl+R 看效果）
> 本课目标：让组件"自己记住会变的数据"——这是 React 的心脏

---

## 0. 为什么需要 state（先想清楚这个问题）

第二课学了 props——**父组件给的、只读**的数据。但真实页面需要"会变的数据"：点赞数、输入框内容、开关状态……

这些数据有两个特点：
1. **属于组件自己**（不是父组件塞进来的）
2. **会变**（用户一点就变）

React 的规矩：**会变的数据 = state**。state 一变，组件自动重画。

> 记忆法：
> - **props = 别人递给你的资料**（只读，看就行）
> - **state = 你自己的记事本**（自己记、自己改）

---

## 1. useState 解剖（就一行，但信息量巨大）

```jsx
const [likes, setLikes] = useState(0)
//     ↑      ↑               ↑
//   当前值  修改函数        初始值
```

拆开看：
- `useState(0)`：跟 React 说"我要一个状态，初始值是 0"，React 返回一个**数组**
- `const [likes, setLikes] = ...`：**解构**数组（练习 07 学过的解构！）——第 0 位是当前值，第 1 位是修改函数
- 名字是自己起的：`[count, setCount]`、`[name, setName]`、`[todos, setTodos]`……约定俗成 `set + 名字`

**为什么用解构？** 因为 React 返回的是 `[值, 改它的函数]` 这样的数组，解构是最优雅的接法。

---

## 2. 怎么改 state：`setLikes(新值)`

```jsx
setLikes(likes + 1)     // ✅ 传一个新值
likes = likes + 1       // ❌ 直接改！React 不知道，不会重画
```

**关键：绝不能直接改 state 变量，必须通过 set 函数传"新值"**——这和你练习 08 学的不可变性是一回事：
- 练习 08：`todos = todos.map(...)`（造新数组，旧的不碰）
- React：`setTodos(新数组)`（传新值，React 才"看见"变化去重画）

> 记法：**set = "通知 React：值变了，请重画"**。直接改 = 偷偷改，React 蒙在鼓里。

---

## 3. 事件：onClick

```jsx
<button onClick={() => setLikes(likes + 1)}>❤️ {likes}</button>
//          ↑ 事件名            ↑ 传一个函数（点击时才执行）
```

注意：**onClick 接收的是函数，不是调用**！

```jsx
onClick={() => setLikes(likes + 1)}   // ✅ 箭头函数 = 描述"点击后做这个"
onClick={setLikes(likes + 1)}         // ❌ 页面一加载就执行了！
```

（练习 04 的"引用 vs 调用"坑，React 里天天遇到，这次记住了就值了。）

---

## 4. 点击后发生了什么（React 的心跳）

```
你点了 ❤️ 按钮
    ↓
onClick 里的箭头函数执行 → setLikes(1)
    ↓
React 发现 likes 变了（0 → 1）
    ↓
自动重新执行 ProfileCard 函数 → 重新渲染
    ↓
页面显示 ❤️ 1
```

**你从头到尾没碰过 DOM**——没有 getElementById、没有 textContent（对比你练习 02~05 的手动时代）。这就是声明式：**你只管说"数据变成什么"，React 负责让页面跟上**。

---

## 5. 动手任务：给名片加"点赞"

在 `src/components/ProfileCard.jsx` 里改造：

```jsx
// src/components/ProfileCard.jsx
import { useState } from 'react'          // ① 引入 useState

function ProfileCard({ name, title, avatar, skills }) {
  const [likes, setLikes] = useState(0)   // ② 声明 state

  return (
    <div className="card">
      <div className="avatar">{avatar}</div>
      <h1>{name}</h1>
      <p>{title}</p>
      <div className="tags">
        {skills.map((skill) => (
          <span className="tag" key={skill}>{skill}</span>
        ))}
      </div>
      <button className="like-btn" onClick={() => setLikes(likes + 1)}>
        ❤️ {likes}
      </button>
    </div>
  )
}

export default ProfileCard
```

给 `App.css` 加个按钮样式：

```css
.like-btn {
  margin-top: 16px;
  border: none;
  border-radius: 999px;
  background: #ffe0e0;
  color: #d64545;
  padding: 6px 18px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}
.like-btn:hover { background: #ffd0d0; }
```

**体会实验（重点！）**：
1. 点 Syun 的 ❤️ → 只 Syun 的数字变，小明的不动——**state 是每个组件实例自己一份**（两个 ProfileCard = 两份独立的 likes）
2. 点几下后，观察页面只有按钮区域变化——React 只重画需要重画的

---

## 常见报错速查

| 报错 | 原因 |
|------|------|
| `'useState' is not defined` | 忘了 `import { useState } from 'react'` |
| `Too many re-renders` | onClick 里写了 `setLikes(likes + 1)`（没包箭头函数）→ 渲染时无限自调 |
| 点了没反应 | 检查是不是直接 `likes = likes + 1` 了（要 setLikes） |

## 预习
- 第三课结束，你已掌握 React 三大件：组件 / props / state。
- 第四课把这些合起来：**用 state 做待办清单的 React 版**（你练习 03 的终极进化形态）
