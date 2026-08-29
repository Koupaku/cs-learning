// 练习 02：猜数字游戏
// 任务说明见 README.md
// 这是你第一次写"网页逻辑"——JS 不再只会在终端打印，
// 而是能和页面上的输入框、按钮、文字实时互动。

// ========== 第 1 步：把页面元素"抓"到 JS 里 ==========
// document.getElementById('元素id') 用来选中页面上的元素
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const message = document.getElementById('message');
const attemptsText = document.getElementById('attempts');
const resetBtn = document.getElementById('resetBtn');

// ========== 第 2 步：游戏状态（记录游戏进行到哪了） ==========
let target = 0;       // 目标数字（待会 newGame 里生成）
let attempts = 0;     // 猜了几次
let gameOver = false; // 游戏是否结束

// ========== 第 3 步：新游戏 ==========
function newGame() {
  // TODO 1: 生成 1~100 的随机整数，存进 target
  // 提示：
  //   Math.random()        → 0~1 之间的随机小数（不含 1）
  //   Math.random() * 100  → 0~100 之间的小数（不含 100）
  //   Math.floor(x)        → 向下取整，比如 Math.floor(3.9) === 3
  // 先想清楚：怎么得到 1~100 的整数？

  attempts = 0;
  gameOver = false;
  guessInput.value = '';
  message.textContent = '来试试吧';
  attemptsText.textContent = '已猜 0 次';
  resetBtn.style.display = 'none';
}

// ========== 第 4 步：猜一次 ==========
function makeGuess() {
  if (gameOver) return; // 游戏结束就什么也不做

  // TODO 2: 读取输入框里的数字，转成数字类型存进 guess
  // 提示：guessInput.value 是字符串（比如 "42"），
  //       Number("42") 或 parseInt("42", 10) 都能转成数字 42
  const guess = 0;

  // 防御：如果没输入或输入非法，直接提示并退出
  if (!guess || guess < 1 || guess > 100) {
    message.textContent = '请输入 1~100 之间的数字';
    return;
  }

  attempts = attempts + 1;
  attemptsText.textContent = `已猜 ${attempts} 次`;

  // TODO 3: 比较 guess 和 target，给出提示（这是游戏的核心逻辑）
  //  - guess 比 target 大 → message.textContent = '📉 太大了！'
  //  - guess 比 target 小 → message.textContent = '📈 太小了！'
  //  - 相等 → 恭喜信息 + 把 gameOver 设为 true + 显示"再来一局"按钮
  //    恭喜信息示例：`🎉 恭喜！就是 ${target}，你用了 ${attempts} 次`
}

// ========== 第 5 步：把按钮和函数"接上线" ==========
// 事件：addEventListener('click', 函数) = "当按钮被点击时，执行这个函数"
guessBtn.addEventListener('click', makeGuess);
resetBtn.addEventListener('click', newGame);

// ========== 第 6 步：开局 ==========
newGame();
