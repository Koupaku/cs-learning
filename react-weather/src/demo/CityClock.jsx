import { useState, useEffect } from "react"

function CityClock() {
    const [city, setCity] = useState(`北京`)
    const [time, setTime] = useState(``)
    
    const cities ={
            北京:{code:`zh-CN`, Zone:`Asia/Shanghai`},
            东京:{code:`ja-JP`, Zone:`Asia/Tokyo`},
            华盛顿:{code:`en-US`, Zone:`America/New_York`},
        }

    ;

    
    useEffect(() =>{
        const { code , Zone } = cities[city] ;
        const readTime = () => new Date().toLocaleTimeString(code, { timeZone: Zone })
        setTime(readTime())

        const timer = setInterval(() => {
            setTime(readTime())
        }, 1000);

        return () => clearInterval(timer)
    },[city])

    return(
        <div className="demo-box">
            <h3>现在是 {city} 时间</h3>
            <p> {time} </p>
            <button onClick={() => setCity(`华盛顿`)}>华盛顿</button>
            <button onClick={() => setCity(`东京`)}>东京</button>
            <button onClick={() => setCity(`北京`)}>北京</button>
        </div>
         
        
    )
}


export default CityClock
