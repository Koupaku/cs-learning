# React 第二课：props —— 组件怎么"传参" 🎭

> 配套项目：`react-weather/`（改完代码记得 Ctrl+R 手动刷新看效果）
> 本课目标：让组件接收参数（props），实现"一个组件，喂不同数据，长出不同样子"

---

## 0. 回顾第一课的困惑

第一课留了问题：**为什么 `skills` 写在组件外面、`name` 写在组件里面？**

因为现在的 ProfileCard 是个"封闭的盒子"——数据写死在自己肚子里，换个名字要改代码，没法复用。

**本课解决**：让 ProfileCard 变成"能接收参数的函数"——外面喂什么，它显示什么。

---

## 1. props 是什么

组件 = 函数（第一课学的）。函数有参数，组件也有——**props**（properties 的缩写）：

```jsx
// 以前：参数写死在函数里
function ProfileCard() {
  const name = 'Syun'          // 写死
  return <h1>{name}</h1>
}

// 现在：参数从外面来
function ProfileCard(props) {   // props = 一个装着所有参数的对象
  return <h1>{props.name}</h1>  // props.name 取名字
}
```

**使用组件时传参**（就像调用函数时传参）：

```jsx
<ProfileCard name="Syun" title="前端开发学习者" avatar="👨‍💻" />
//              ↑ 这些看起来像 HTML 属性，其实是"传进函数的参数"
```

> 记忆法：`<ProfileCard name="Syun" />` ≈ `ProfileCard({ name: 'Syun' })`——**props 就是一个对象**，JSX 属性就是对象的键值对。

**更地道的写法：解构**（你练习 07 学过解构，老朋友了）：

```jsx
function ProfileCard({ name, title, avatar, skills }) {
  return <h1>{name}</h1>      // 直接当变量用，不用写 props.xxx
}
```

---

## 2. props 的三大纪律（面试必考）

1. **单向流动**：只能**父 → 子**（App 传给 ProfileCard），子不能回头改父的数据
2. **只读**：子组件**不能修改**收到的 props（想改？那是 state 的事，第三课）
3. **可传任何类型**：字符串、数字、数组、对象、甚至**函数**（第四课用）

---

## 3. 动手任务：拆文件 + 传 props

### 第 1 步：把 ProfileCard 搬进自己的文件

新建 `src/components/ProfileCard.jsx`（先建 components 文件夹），内容：

```jsx
// src/components/ProfileCard.jsx
// 组件文件化：一个组件一个文件（练习 09 的模块化思想，React 里的标准做法）

function ProfileCard({ name, title, avatar, skills }) {
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
    </div>
  )
}

export default ProfileCard
```

### 第 2 步：App.jsx 变成"组装车间"

```jsx
// src/App.jsx
import './App.css'
import ProfileCard from './components/ProfileCard.jsx'   // 引入组件（import 语法练习 09 学过！）

function App() {
  return (
    <>
      <ProfileCard
        name="Syun"
        title="前端开发学习者"
        avatar="👨‍💻"
        skills={['JavaScript', 'HTML/CSS', 'React 学习中']}
      />
      <ProfileCard
        name="小明"
        title="UI 设计师"
        avatar="🎨"
        skills={['Figma', 'Photoshop', '插画']}
      />
    </>
  )
}

export default App
```

### 第 3 步：观察（体会"复用"的威力）

页面出现**两张不同名片**——同一个组件，喂不同 props，长出不同样子。
改 App.jsx 里任一名片的数据 → 保存 → Ctrl+R → 只有那一张变。

---

## 4. 为什么这张卡片是 React 的"魂"

回到第一课：组件 = 函数。加上本课：**组件 = 接收 props 的函数**。

一张名片卡是组件；一个天气卡片也可以是组件；一个"城市按钮"也可以是组件。
将来你的整个页面 = 一堆组件嵌套拼起来，数据从顶层一路往下传——这就是 React 的全部骨架。

**面试高频题"什么是 props？"答案模板**：
> props 是父组件传给子组件的数据对象，单向流动、只读。子组件通过解构接收，用 props 让同一个组件在不同数据下渲染出不同 UI。

---

## 常见报错速查

| 报错 | 原因 |
|------|------|
| `'ProfileCard' is not defined` | 忘了 import，或 import 路径/文件名拼错（`.jsx` 不能省） |
| `Cannot read properties of undefined (reading 'name')` | 传参时忘了传 `name`，组件里读不到 → 检查 JSX 属性 |
| 页面空白 + Console 红字 | 常见于 `skills` 没传导致 `.map` 报错 → 检查每个 prop 都传了 |
