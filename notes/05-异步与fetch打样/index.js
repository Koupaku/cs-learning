// ===== 打样：fetch / async / await（练习05「天气卡片」的零件） =====
// 使用方法：双击 index.html 打开，F12 看 Console
// 学习法：每个零件 = 先演示 → 再解释 → 最后组装成天气查询

// ------------------------------------------------------------
// 【零件 1】先理解"为什么需要异步"
// ------------------------------------------------------------
// 之前的代码都是"同步"的：从上到下，一行执行完才执行下一行，快如闪电
// 但"从网络拿数据"很慢（要发请求、等服务器回话，可能要几百毫秒甚至几秒）
// 如果程序傻等，整个页面就会"卡死"不能点——这不可接受
// 所以 JS 用【异步】：先答应你"数据到了我再来处理"，页面继续该干嘛干嘛

// 比喻：你去奶茶店点单
//   同步 = 站在柜台前干等，等奶茶做好才走（期间啥也干不了）
//   异步 = 拿小票走人，到号了店员喊你（小票就是"Promise"，喊你就是在"兑现"）

// ------------------------------------------------------------
// 【零件 2】Promise：异步的"小票"
// ------------------------------------------------------------
// fetch(网址) 会立刻返回一张"小票"（Promise 对象），
// 数据到没到先不管，小票先给你
const ticket = fetch('https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true');
console.log('零件2：fetch 立刻返回了小票（Promise）：', ticket);
console.log('零件2：注意！数据还没到，程序已经继续往下跑了 —— 这就是异步');

// ------------------------------------------------------------
// 【零件 3】await：站在柜台等"到号"
// ------------------------------------------------------------
// 小票拿到手了，但我们要的是数据本身 → 用 await 等它兑现
// await 只能用在 async 函数里 → 所以外面包一层 async 函数
async function getWeather() {
  console.log('零件3：开始等数据...');

  // await = "我就在这等到号"，等 fetch 的"小票"兑现成真正的回应
  const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true');
  console.log('零件3：回应到了！response 是：', response);

  // 回应是一堆"乱七八糟的字节"，要解析成能用的对象
  // response.json() 也是异步的，也要 await
  const data = await response.json();
  console.log('零件3：解析后的数据对象：', data);

  // 挖出我们要的：温度、风速（试试在 Console 里点开 data 看看结构！）
  const temp = data.current_weather.temperature;
  const wind = data.current_weather.windspeed;
  console.log(`零件3：北京现在的温度 ${temp}°C，风速 ${wind} km/h`);

  // 显示到页面
  const weatherDiv = document.getElementById('weather');
  weatherDiv.textContent = `北京：${temp}°C，风速 ${wind} km/h`;
}
getWeather();   // 调用（异步函数不会阻塞页面）

// ------------------------------------------------------------
// 【零件 4】async/await 的错误处理：try/catch
// ------------------------------------------------------------
// 网络会失败（断网、网址错、服务器挂了）——不做处理程序会"悄悄失败"
// try/catch = 试试看，出错了就接住
async function getWeatherWithErrorHandling() {
  try {
    const response = await fetch('https://这个网址肯定不存在.com/xxx');
    const data = await response.json();
    console.log('零件4：数据是', data);
  } catch (error) {
    console.log('零件4：出错了！错误信息：', error.message);
    console.log('零件4：这就是 try/catch —— 出错不会让程序崩溃，而是走这里');
  }
}
getWeatherWithErrorHandling();

// ------------------------------------------------------------
// 【零件 5】await 的用法小总结
// ------------------------------------------------------------
// const response = await fetch(网址);  // 1. 拿回应
// const data = await response.json();  // 2. 解析成对象
// data.xxx                              // 3. 挖数据
// 包在 try { } catch (error) { } 里    // 4. 出错有兜底
// 全部写在 async function 里           // 5. 前提条件
//
// 去 exercises/05-weather-card/app.js 组装成你的天气卡片！
// ------------------------------------------------------------
