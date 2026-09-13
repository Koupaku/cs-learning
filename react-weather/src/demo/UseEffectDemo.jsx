// ===== 打样：useEffect（副作用）——「五练」第 1 练 =====
// 怎么用这个文件：
//   1. npm run dev -- --host 127.0.0.1
//   2. 打开 http://127.0.0.1:5173/  然后按 F12 → Console
//   3. 四个盒子挨个点一点，盯着 Console 看"什么时候多一条、什么时候不多"
// 一句话人话解释：
//   useEffect = 给组件装一个"闹钟"，告诉 React：「重画完了之后，顺便帮我做这件事」。
//   第二个参数（依赖数组）= 你盯着谁。盯着的人变了，闹钟才重新响。

import { useEffect, useState } from 'react'

// ------------------------------------------------------------
// 【零件 1】useEffect 不写第二个参数 → 每次渲染后都跑
// ------------------------------------------------------------
function Part1() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // 没有依赖数组 = "我不盯人，每次重画后都跑"
    // 组件函数每被调用一次（= 每重画一次），这里就执行一次
    console.log('【零件1】跑了，当前 count =', count)
  }) 

  return (
    <div className="demo-box">
      <h3>零件 1：不写依赖数组</h3>
      <p>count = {count}</p>
      <button onClick={() => setCount(count + 1)}>点我 +1</button>
      <p className="demo-hint">
        现象：刷新页面就来一条（首次渲染后），每点一次再来一条。<br />
        危险：这里要是写 fetch，每点一次就发一次网络请求。
      </p>
    </div>
  )
}

// ------------------------------------------------------------
// 【零件 2】空数组 [] → 只在"首次挂载后"跑一次
// ------------------------------------------------------------
function Part2() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // 空数组 = "我谁也不盯"，既然没人变，就永远不再触发 → 只跑一次
    console.log('【零件2】我只跑一次（开发模式下会看到两条，见下方说明）')
  }, [])

  return (
    <div className="demo-box">
      <h3>零件 2：空数组 []</h3>
      <p>count = {count}</p>
      <button onClick={() => setCount(count + 1)}>点我 +1</button>
      <p className="demo-hint">
        现象：随便点，这条打印再也不出现。<br />
        怪现象：开发模式刷新时可能看到【两条】——这是 React 的 StrictMode 故意的（帮你查副作用干不干净），生产环境只有一条，面试会问。
      </p>
    </div>
  )
}

// ------------------------------------------------------------
// 【零件 3】[count] → 首次 + count 变化时跑（其他 state 变化不跑）
// ------------------------------------------------------------
function Part3() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')

  useEffect(() => {
    // 盯着 count：只有 count 变了才跑
    console.log('【零件3】我盯着 count，现在它 =', count)
  }, [count])

  return (
    <div className="demo-box">
      <h3>零件 3：盯着 count</h3>
      <p>count = {count}</p>
      <button onClick={() => setCount(count + 1)}>count +1（Console 会多一条）</button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在这里打字试试"
      />
      <p className="demo-hint">
        现象：打字时组件也在重画（输入框有变化），但 count 没变 → Console 不会多。<br />
        这就是「依赖数组」的全部意义：<b>精确控制副作用什么时候执行</b>。
      </p>
    </div>
  )
}

// ------------------------------------------------------------
// 【零件 4】清理函数 return () => {} —— 副作用的"善后"
// ------------------------------------------------------------
function Part4() {
  const [running, setRunning] = useState(false) // 秒表在不在跑
  const [seconds, setSeconds] = useState(0) // 走了几秒

  useEffect(() => {
    if (!running) return // 没在跑 → 不装定时器，提前收工
//为什么!running可以代表没在跑？

    console.log('【零件4】装上定时器 ⏱️')
    const timer = setInterval(() => {
      // 函数式更新：prev 是"上一次的值"，用它算新的（这里每 1 秒 +1）
      // 为什么不用 setSeconds(seconds + 1)？因为 effect 只认它出生时看到的 seconds（永远是 0）
      setSeconds((prev) => prev + 1)
    }, 1000)
//Interval() 也应该讲一下
    // ★ 清理函数：React 在"拆掉这个副作用"时执行它
    //   两种情况会拆：① 依赖(running)变了，重装前先拆旧的 ② 组件被移除时
    return () => {
      console.log('【零件4】拆掉定时器 🧹')
      clearInterval(timer)
    }
  }, [running]) // 盯着 running：开关一变，先清理、再重新装

  return (
    <div className="demo-box">
      <h3>零件 4：定时器 + 清理函数</h3>
      <p>已走 {seconds} 秒</p>
      <button onClick={() => setRunning(!running)}>{running ? '暂停' : '开始'}</button>{' '}
      <button onClick={() => setSeconds(0)}>清零</button>
      <p className="demo-hint">
        现象：每次开始/暂停，Console 都是一对「装上 → 拆掉」。<br />
        收获：清理函数 = 走之前把东西收拾好（关定时器、取消订阅），不然会"漏"。
      </p>
    </div>
  )
}

// ------------------------------------------------------------
// 【总装】把四个零件摆到页面上
// ------------------------------------------------------------
function UseEffectDemo() {
  return (
    <div className="demo-wrap">
      <h1>useEffect 打样 · 第 1 练（打开 F12 看 Console）</h1>
      <Part1 />
      <Part2 />
      <Part3 />
      <Part4 />
    </div>
  )
}

export default UseEffectDemo
