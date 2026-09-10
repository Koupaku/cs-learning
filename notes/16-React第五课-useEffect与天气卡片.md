# React 第五课：useEffect + 把天气卡片搬进 React 🌤️

> 配套项目：`react-weather/`（改完 Ctrl+R）
> 本课目标：学会 useEffect（副作用）——让 React 组件能"联网要数据"
> 节奏：**继续分步走**，每步都能跑、都能验证

---

## 0. 为什么需要 useEffect？

前四课的所有数据都是"自己造的"：state 里的数组、用户输入的字。但真实应用要**跟外面的世界打交道**：

- 联网要数据（fetch）
- 定时器（setInterval）
- 读写浏览器存储（localStorage）
- 手动操作 DOM（很少用）

这些"**渲染之外的同步动作**"叫**副作用（side effect）**。React 的规矩：

> **渲染时只管生成 JSX（纯洁、无副作用）；要做别的事，写进 useEffect。**

**为什么不能在组件函数体里直接 fetch？**
因为组件函数会被**反复调用**（每次 state 变就重新跑一遍）。要是在函数体里 fetch，每敲一个字母都会发一次网络请求！useEffect 就是用来**控制"什么时候执行副作用"**的。

---

## 1. useEffect 解剖

```jsx
import { useEffect } from 'react'

useEffect(() => {
  // 这里写副作用代码（联网、定时器……）
}, [依赖数组])
```

**依赖数组决定"什么时候跑"**（本课重点）：

| 写法 | 什么时候执行 | 典型用途 |
|------|-------------|---------|
| `useEffect(fn)` | **每次渲染后**都跑 | 很少用（容易出事） |
| `useEffect(fn, [])` | **只在首次挂载后**跑一次 | 初始化时拉一次数据 |
| `useEffect(fn, [city])` | 首次 + **city 变化时**跑 | 城市变了，重新拉数据 |

**记忆法**：依赖数组 = "**我盯着谁**"。盯着的人变了，我才重新执行。

> ⚠️ 你会遇到一个怪现象：开发模式下 `useEffect(fn, [])` 看起来跑了**两次**。这是 React StrictMode（开发时故意双跑，帮你发现副作用没写干净）——**生产环境只跑一次，不用担心**。面试常问，先混脸熟。

---

## 2. 新知识：用 state 表示"界面的状态"

联网有三种情况：**加载中 / 成功 / 失败**。React 里的标准做法——用 state 记住"现在是什么情况"：

```jsx
const [weather, setWeather] = useState(null)   // 数据（成功时才有）
const [loading, setLoading] = useState(false)  // 是不是在加载
const [error, setError] = useState('')         // 错误信息
```

然后 JSX 里**按状态显示不同内容**（"视图区只放值"的实战）：

```jsx
{loading && <p>加载中...</p>}
{error && <p className="error">{error}</p>}
{weather && <p>{weather.temperature}°C</p>}
```

`&&` 的作用：左边为 true 才显示右边（JSX 里的条件渲染写法之一，和三元是兄弟）。

---

## 3. 分步建：五步做出 React 版天气卡片

### 第 1 步：先做"一张写死的"天气卡片（不联网）

新建 `src/components/WeatherCard.jsx`：

```jsx
import { useState } from 'react'

function WeatherCard() {
  // 先用假数据（一会儿换成真数据）
  const [weather, setWeather] = useState({
    city: '北京',
    temperature: 25.3,
    windspeed: 8.4,
    weathercode: 1,
  })

  const weatherMap = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 61: '🌧️', 95: '⛈️' }

  return (
    <div className="weather-card">
      <div className="weather-emoji">{weatherMap[weather.weathercode] ?? '❓'}</div>
      <div className="city-name">{weather.city}</div>
      <div className="temp">{weather.temperature}°C</div>
      <div className="wind">风速 {weather.windspeed} km/h</div>
    </div>
  )
}

export default WeatherCard
```

`App.jsx` 改成 `return <WeatherCard />`。

**验证**：页面出现一张静态天气卡片。
**意义**：先确认"数据 → JSX"这条路通了，联网是下一步的事。

---

### 第 2 步：加 useEffect，先把数据打到 Console

```jsx
import { useEffect, useState } from 'react'

function WeatherCard() {
  const [weather, setWeather] = useState(null)   // 一开始没有数据

  useEffect(() => {
    async function load() {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true'
      )
      const data = await response.json()
      console.log('拿到数据了：', data.current_weather)   // ← 先只打印
    }
    load()
  }, [])   // ← 空数组：只在首次挂载后跑一次

  return <div className="weather-card">（数据还没接上）</div>
}
```

**验证**：打开 F12 → Console，刷新页面 → 看到打印的天气对象。
**注意两点**：
1. `useEffect` 的回调**不能直接写 async**，所以在里面定义 `async function load()` 再调用
2. 空数组 `[]` 保证只发一次请求

---

### 第 3 步：把数据存进 state，渲染出来

把第 2 步的 `console.log` 换成：

```jsx
      setWeather({
        city: '北京',
        temperature: data.current_weather.temperature,
        windspeed: data.current_weather.windspeed,
        weathercode: data.current_weather.weathercode,
      })
```

JSX 改成（注意"只有 weather 有值时才渲染"）：

```jsx
  return (
    <div className="weather-card">
      {weather ? (
        <>
          <div className="weather-emoji">{weatherMap[weather.weathercode] ?? '❓'}</div>
          <div className="city-name">{weather.city}</div>
          <div className="temp">{weather.temperature}°C</div>
          <div className="wind">风速 {weather.windspeed} km/h</div>
        </>
      ) : (
        <p>加载中...</p>
      )}
    </div>
  )
```

**验证**：刷新 → 短暂"加载中" → 出现真实天气。
**这一步的关键**：**fetch 拿到数据 → setState → React 重画**。这就是"异步 + state"的组合。

---

### 第 4 步：加上 loading / error 状态（专业做法）

```jsx
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(URL)
        const data = await response.json()
        setWeather({ ... })
      } catch (err) {
        setError('查询失败，请检查网络')
      } finally {
        setLoading(false)      // 不管成功失败，都不再"加载中"了
      }
    }
    load()
  }, [])
```

JSX 里依次判断：

```jsx
      {loading && <p className="loading">加载中...</p>}
      {error && <p className="error">{error}</p>}
      {weather && ( ...真正的卡片... )}
```

**验证**：把网址改错几个字母 → 页面显示红色错误提示（而不是白屏）。

---

### 第 5 步：加城市按钮（依赖数组的威力）

```jsx
  const [city, setCity] = useState('北京')

  const cities = {
    北京: { lat: 39.9, lon: 116.4 },
    上海: { lat: 31.2, lon: 121.5 },
    广州: { lat: 23.1, lon: 113.3 },
    深圳: { lat: 22.5, lon: 114.1 },
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const { lat, lon } = cities[city]
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        const data = await response.json()
        setWeather({ city, ...data.current_weather })   // 展开赋值，省事
      } catch (err) {
        setError('查询失败，请检查网络')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [city])   // ★ 盯着 city：city 一变就重新拉数据
```

按钮：

```jsx
  return (
    <div className="weather-card">
      <h1>🌤️ 天气卡片</h1>
      <div className="city-btns">
        {Object.keys(cities).map((name) => (
          <button key={name} onClick={() => setCity(name)}>{name}</button>
        ))}
      </div>
      ...
```

**验证**：点"上海" → 先"加载中" → 变成上海的天气。
**这一步的收获**：**依赖数组 = React 的"自动重跑机制"**——你不用手写"点击城市后去 fetch"，只需更新 `city` 这个 state，useEffect 看见依赖变了，自动重新执行。

> `setWeather({ city, ...data.current_weather })` 里的 `...` 是展开运算符（练习 08 学的），把 API 返回的字段摊开塞进对象，再加上 city。

---

## 4. CSS（App.css 追加）

```css
.weather-card { background: white; padding: 24px 32px; border-radius: 16px; width: 340px; box-shadow: 0 10px 30px rgba(0,0,0,.15); text-align: center; }
.weather-card h1 { margin: 0 0 12px; font-size: 20px; }
.city-btns { display: grid; grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)); gap: 8px; margin-bottom: 16px; }
.city-btns button { border: none; border-radius: 8px; background: #eef2ff; padding: 8px 4px; cursor: pointer; transition: .2s; }
.city-btns button:hover { background: #dde5ff; }
.weather-emoji { font-size: 64px; }
.city-name { font-size: 18px; font-weight: bold; }
.temp { font-size: 44px; font-weight: bold; }
.wind { color: #666; }
.loading { color: #4a90d9; }
.error { color: #e05d5d; }
```

---

## 5. 验收标准

- [ ] 首次打开：短暂"加载中" → 显示北京天气
- [ ] 点其他城市 → 重新加载 → 显示新城市天气
- [ ] 断网或改错网址 → 显示红色错误提示，不白屏
- [ ] 全程只有 useEffect 一处联网，没有手动 DOM 操作

## 6. 面试高频（先记结论）

| 问题 | 答案要点 |
|------|---------|
| 为什么不能在组件函数体里 fetch？ | 组件每次渲染都会重跑，会导致重复请求/死循环 |
| 依赖数组是干什么的？ | 控制副作用何时执行；`[]` 只跑一次，`[x]` 盯住 x |
| 为什么开发时 useEffect 跑两次？ | StrictMode 故意双跑，帮你发现副作用没清理干净 |
| 清理函数是什么？ | `useEffect` 里 `return () => {...}`，组件卸载或依赖变化前执行（下节课细讲） |

---

## 完成后

```bash
git add .
git commit -m "React第五课：useEffect与天气卡片"
git push
```

**下一站**：React 三大件（组件/props/state）+ useEffect 全部到齐 → **给你的「逐句阅读器」立项**（M0 原型）。
