# 练习 01：成绩分析器（Score Analyzer）

> 主题：数组方法 map / filter / reduce + 模板字符串 + 箭头函数
> 难度：入门 · 预计 40~60 分钟
> 目标：这是你掌握 ES6 核心的第一个台阶，也是未来面试题的高频考点。

> ⚠️ **没学过 map/filter/reduce？先看这个教程（约 30 分钟）：**
> `notes/01-map-filter-reduce入门.md` —— 看完再回来做题。

---

## 任务

打开 `scores.js`，里面有一个学生成绩数组。你要实现 5 个函数，让最后的输出像这样：

```
全班 6 人，平均分 74.83，最高分 95，最低分 52
及格（≥60）：6 人中的 4 人
加分 5% 后的成绩：[52.5, 68.25, 73.5, 78.75, 89.25, 99.75]
最高分同学：李雷，95 分
```

## 要求（每题必须用指定方法，不许用 for 循环）

1. `calcAverage(scores)` —— 用 **reduce** 算平均分（保留 2 位小数）
2. `findMax(scores)` / `findMin(scores)` —— 用 **Math.max/min 配合展开运算符** `...`
3. `getPassed(students)` —— 用 **filter** 过滤出及格（≥60）的同学，返回名字数组
4. `boostScores(scores)` —— 用 **map** 给每个分数加 5%（即 ×1.05）
5. `formatTopStudent(students)` —— 找出最高分同学，用**模板字符串**返回 "名字，XX 分"

## 运行方式

在终端进入本目录，运行：

```bash
node scores.js
```

看到上面格式的输出即算通过。

## 提示（先自己想，卡住 15 分钟再看）

- reduce 的写法：`arr.reduce((累加器, 当前值) => ..., 初始值)`
- 模板字符串：`` `结果：${变量}` ``
- `Math.max(...scores)` 能一次取出数组最大值

## 完成后（Git 流程，第 1 次体验）

1. 打开终端，进入 `exercises/01-score-analyzer` 目录
2. 依次执行：
   ```bash
   git init
   git add .
   git commit -m "完成练习01：成绩分析器"
   ```
3. 去 GitHub 新建一个仓库（名字随意，比如 `js-exercises`），然后按 GitHub 页面提示把本地代码推上去（push）
4. 把仓库链接发给我，我来看你的代码

> 如果 push 报错或看不懂提示，直接贴给我，我帮你解决。
