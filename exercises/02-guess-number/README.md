# 练习 02：猜数字游戏 🎯

> 主题：DOM 操作 + 事件 + Math.random + if/else 判断
> 难度：入门 · 预计 1~2 小时
> 意义：**你人生第一个能在浏览器里互动的作品！** 做完可以发给朋友玩。

---

## 玩法

电脑随机想一个 1~100 的数字，你在输入框里猜。猜大了提示"太大了"，猜小了提示"太小了"，直到猜中为止，看看你几次能猜中。

## 运行方式

**双击 `index.html`** 用浏览器打开即可（不需要服务器，也不需要 node）。

## 你的任务（game.js 里 3 个 TODO）

| TODO | 内容 | 用到的知识 |
|------|------|-----------|
| 1 | 生成 1~100 随机整数 | Math.random / Math.floor |
| 2 | 读取输入框数字 | value 属性 / Number() |
| 3 | 比较大小给提示 | if / else if / else + textContent |

## 新概念速览（做之前先读一遍）

**1. DOM = 页面和 JS 之间的桥**
```js
document.getElementById('guessInput')  // 找到页面上 id="guessInput" 的元素
guessInput.value                        // 读取输入框里的内容（字符串）
message.textContent = '你好'            // 把页面上的文字改成"你好"
```

**2. 事件 = 用户动作的触发器**
```js
guessBtn.addEventListener('click', makeGuess);
// 读法：当 guessBtn 被点击（click）时，执行 makeGuess 函数
```

**3. Math.random() 生成随机数**
```js
Math.random()        // 0 ~ 0.999... 的小数
Math.floor(Math.random() * 100) + 1   // 1 ~ 100 的整数
// 解释：random()*100 得到 0~99.99，floor 取整得 0~99，+1 得 1~100
```

## 完成后（这次要提交 GitHub 了）

在 `ComputerScience` 根目录打开终端，执行：

```bash
git init
git add .
git commit -m "完成练习01和练习02"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

> 第 5 行的地址要换成你 GitHub 上新建仓库给的那个。
> 如果 `git commit` 报错说需要身份，先执行：
> ```bash
> git config --global user.name "你的名字"
> git config --global user.email "你的邮箱"
> ```

然后把仓库链接发给我，我会在上面检查你练习 01 的最终代码。

## 加分项（做完基础版再挑战）

1. 按**回车键**也能猜（提示：监听 `keydown` 事件）
2. 猜的数字显示在"历史记录"里（提示：动态创建元素 `document.createElement`）
3. 统计平均每局用了几次
