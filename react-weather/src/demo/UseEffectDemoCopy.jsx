 import { useEffect,useState } from "react";

 /*
对于useEffect，我更希望优先读到它的写法所代表的含义，特别是出现了括号或者箭头的情况


应该这样介绍useState: 
useState()括号需要填写初始值initialState,返回一个数组[当前状态, 更新状态的函数],
可以用JS的解构写法……  const [count, setCount] = useState(0)……

并且在react特殊语法的地方进行区分，
*/


 function Part1() {
    const [count,setCount] = useState(0);

    useEffect(()  => {console.log(`[零件1]跑了，当前 count= `,count);
    }) //useEffect 箭头指向了由`{}`包裹的一个函数，这个叫什么？

    return(
        <div className="demo-box">
            <h3>零件1</h3>
            <p>count = {count}</p>
            <button onClick={() => setCount(count+1)}>点我+1</button>
            <p className="demo-hint">
                现象：刷新页面就来一条（首次渲染后），每点一次再来一条。<br />
                危险：这里要是写 fetch，每点一次就发一次网络请求。
            </p>
        </div>
    )
 }

function Part2() {
    const [count, setCount] = useState(0);

    useEffect(() => {console.log(`[零件2]跑了，当前 count= `,count);
    }, []);  //像现在就可以解释一下{A,B}中A和B分别代表什么，要怎么引用

    return(
        <div className="demo-box">
            <h3>零件2</h3>
            <p>count = {count}</p>
            <button onClick={() => setCount(count+1)}>点我+1</button>
            <p className="demo-hint">
             现象：随便点，这条打印再也不出现。<br />
             怪现象：开发模式刷新时可能看到【两条】——这是 React 的 StrictMode 故意的（帮你查副作用干不干净），生产环境只有一条，面试会问。
            </p>
        </div>
    )
}

function Part3() {
    const [count,setCount] = useState(0);
    //const [text,setText] =useState(0);
    const [text,setText] = useState(''); //储存文本

    useEffect(() => {console.log(`[零件3]跑了，当前 count = `,count);
    },[count])

    return(
        <div className="demo-box">
            <h3>零件3</h3>
            <p>count = {count}</p>
            <button onClick={() => setCount(count+1)}>点我+1(点我console多一条)</button>
            <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在这里打字试试" /> 
            
            <p className="demo-hint">
                现象：打字时组件也在重画（输入框有变化），但 count 没变 → Console 不会多。<br />
                这就是「依赖数组」的全部意义：<b>精确控制副作用什么时候执行</b>。
            </p>
        </div>
    )
}//onChange 我也需要知道读法，总之就是第一次出现的方法或者函数就应该解释它。

function Part4() {
    const [running, setRunning] = useState(false);
    const [seconds,setSeconds] = useState(0);

    useEffect (() => {
        if(!running) return 
        
        console.log(`[零件4]装上timer`);
        const timer = setInterval(() => {
            setSeconds((prev) => prev + 1)
        },1000)
        
        return () => {
            console.log(`[零件4]拆掉timer`);
            clearInterval(timer)
            
        }
    },[running])

    return(
        <div className="demo-box">
            <h3>零件4 timer + 清理</h3>
            <p>已走 {seconds} 秒</p>
            <button onClick={() => setRunning(!running)}>{running ? `暂停` : `开始`}</button>
            <button onClick={() => setSeconds(0)}>清零</button>
            <p className="demo-hint">
                现象：每次开始/暂停，Console 都是一对「装上 → 拆掉」。<br />
                收获：清理函数 = 走之前把东西收拾好（关定时器、取消订阅），不然会"漏"。
            </p>
        </div>
    )//点`开始` 调用setRunning,反转running为true,渲染网页的时候也执行useEffect,
    // running === true 跳过return, log装上timer,timer计时...
    //为什么在同一个对象里的拆掉timer没有被执行？ 一个对象有2个return, 它们和if的关系是怎么样的？

}


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