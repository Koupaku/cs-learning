# 练习 09：天气卡片模块化 🧩

> 主题：ES 模块（import / export）+ 代码拆分
> 难度：入门+ · 预计 2~3 小时
> 特别说明：**这次没有骨架**——只有需求和提示。你从练习 07 的 app.js 出发，把它拆成模块。
> 新零件打样：`notes/09-ES模块打样/`（必看！里面有故意写的错误示范）

---

## 为什么学这个

你以前所有代码都在**一个文件**里。真实项目动辄几十上百个文件——天气数据放一个文件、界面代码放一个、联网逻辑放一个，各管各的，这叫**模块化**。React 项目天生就是一堆文件互相 `import`。

## 你要做的事

把练习 07 的天气卡片（功能完全不变）拆成 4 个文件：

```
exercises/09-weather-modules/
├── index.html      ← 我给了（改成 type="module" 了）
├── style.css       ← 我给了（从 v2 复制）
└── js/
    ├── data.js     ← 你建：只管数据（cities + weatherMap，export 出去）
    ├── ui.js       ← 你建：只管界面（抓元素 + getEmoji + displayWeather）
    ├── api.js      ← 你建：只管联网（fetchWeather）
    └── main.js     ← 你建：入口（import fetchWeather + 绑定事件）
```

**依赖方向（单向流动，别绕圈）**：
```
main.js → api.js → ui.js → data.js
```

## 关键提示（不是代码，是思路）

1. **每个文件先回答三个问题**：我管什么？我要 export 什么给别人？我要 import 什么进来？
   - data.js：export `cities`、`weatherMap`（从 v2 的 app.js 里**剪切**过去，不是复制——代码只能在一个地方存在）
   - ui.js：抓元素（`getElementById`）+ `getEmoji` + `displayWeather`；需要 `weatherMap` → 从 data.js import
   - api.js：`fetchWeather`（v2 里的原样搬）；需要 `cities` 和 `displayWeather` → 各自 import
   - main.js：import `fetchWeather`；按钮事件绑定（v2 里那段 forEach）
2. **import 语法**：`import { 名字 } from './data.js'` —— 名字必须和 export 一致，路径要 `./` 开头、`.js` 结尾
3. **index.html 的 script 标签**：`<script type="module" src="js/main.js"></script>`（我已写好）——type="module" 的脚本**自带延迟执行**，不用担心 DOM 没加载完

## ⚠️ 关键：怎么运行？（先看这个！）

模块**不能双击打开**（浏览器安全策略会拦，报 CORS 错误）。要用服务器运行——你已经装了 **Live Server** 扩展：

1. 在 VS Code 里右键 `index.html` → **"Open with Live Server"**
2. 浏览器自动打开 `http://127.0.0.1:5500/...`，页面能用了
3. 好处：**改代码保存，浏览器自动刷新**（热更新）

> 如果你双击打开看到红字报错——那正是本课要教你的：为什么真实项目都需要"跑一个服务器"。

## 验收标准

- [ ] Live Server 打开后，功能与练习 07 完全一样（点城市出天气 + emoji + 状态提示）
- [ ] 4 个 js 文件职责清晰：data 里没有 DOM 代码，ui 里没有 fetch
- [ ] 改一行 style.css 保存 → 浏览器**自动刷新**看到变化

## 完成后

```bash
git add .
git commit -m "练习09完成：天气卡片模块化"
git push
```

## 加分项

1. **复用**：在 main.js 里加一句 `console.log` 用 `getEmoji(0)`，看跨文件调用
2. **default 导出**：查资料搞懂 `export default` 和命名导出的区别（React 里两种都会见）
3. **再拆一层**：把城市按钮点击的 `btn.dataset.city` 逻辑也抽成一个函数放 main.js
