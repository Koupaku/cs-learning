// 练习 04：秒表 ⏱️
// 任务说明见 README.md
// 新零件 setInterval / clearInterval 的打样在：notes/04-秒表打样/
// 这次只给你"要求"，结构自己搭！卡住先看打样，再卡住就问我

// ===== 抓元素 =====
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

// ===== 状态 =====
let running = false;   // 是否正在计时
let seconds = 0;       // 已过秒数
let timer = null;      // 计时器编号（暂停/重置时要拿它去停止）

// TODO 1: 开始计时
function start() {
  // 要求：
  // 1. 如果 running 已经是 true，直接 return（防止重复开启 → 双倍速！看打样零件4）
  // 2. running = true
  // 3. timer = setInterval(?, 100)  —— 每 100 毫秒调用一次 tick
  //if(running = true){return;};
  if(running){return;}
  running = true;
  //timer = setInterval(()=>tick(),100);
  timer = setInterval(tick,100);
}

// TODO 2: 每次"滴答"要做的事
function tick() {
  // 要求：
  // 1. seconds 加 0.1
  // 2. 更新页面：display.textContent = seconds.toFixed(1) + ' 秒'
    seconds = seconds + 0.1;
    display.textContent = seconds.toFixed(1) + `秒`;
  
}

// TODO 3: 暂停
function pause() {
  // 要求：
  // 1. clearInterval(timer)  —— 停掉计时器
  // 2. running = false
  clearInterval(timer);
  running = false;
}

// TODO 4: 重置
function reset() {
  // 要求：
  // 1. 如果正在计时，先暂停（能不能直接调用 pause()？）
  // 2. seconds = 0
  // 3. 更新页面显示为 "0.0 秒"
  pause();
seconds = 0;
display.textContent = seconds.toFixed(1) +` 秒`;
}

// ===== 绑定事件 =====
startBtn.addEventListener('click', start);
pauseBtn.addEventListener('click', pause);
resetBtn.addEventListener('click', reset);
