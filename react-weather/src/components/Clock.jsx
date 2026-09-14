
import { useState, useEffect } from "react"

function Clock() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if(!running) return;
    const timer = setInterval(() => {
      setSeconds((prev) => prev+1)
    },1000)

    return() =>{
      clearInterval(timer)
    }
  },[running])
  return (
    <div className="demo-box">
      <h3>Clock · 训练 2 闭卷默写</h3>

      <p>已走 {seconds} 秒</p>

      <button onClick={() => setRunning(!running)}>{running ? `暂停` : `开始` }</button>
    </div>
  )
}

export default Clock
