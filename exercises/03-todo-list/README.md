# 练习 03：待办清单 Todo List 📝

> 主题：数据驱动页面 + 动态创建元素 + 事件绑定
> 难度：入门+ · 预计 2~3 小时
> 意义：**这是前端最重要的心智模型**——"数组是数据，页面是数据的镜子"。
> 你以后学的 React，本质就是把这一课规模化。

---

## 功能要求

1. 输入框输入内容，点"添加"或按回车 → 出现在列表里
2. 每个待办旁边有"删除"按钮，点击删除这一条
3. 输入为空时点添加 → 提示（不添加）

## 运行方式

双击 `index.html` 用浏览器打开。

## 核心思想：数据驱动视图

```
todos 数组（数据）  ←→  <li> 列表（视图）
```

- **页面永远只是数组的"投影"**：数组变，页面跟着变
- 你只操作数组（增删），然后调用 `render()` 把数组重新画一遍
- 永远不要"直接改页面"——改数据，页面自己会跟上

这个思想 10 年后依然管用，面试官会问："为什么不用 innerHTML 拼接？""数据驱动和手动操作 DOM 有什么区别？"

## 新概念速览

**1. 动态创建元素**
```js
const li = document.createElement('li');  // 凭空造一个 <li>
li.textContent = '买牛奶';                 // 给它填内容
todoList.appendChild(li);                  // 挂到页面上
```

**2. forEach —— 你已会 map/filter，这是老三**
```js
todos.forEach(todo => { ... });  // 遍历每个元素，做副作用（比如创建页面元素）
// map：每个元素 → 新数组（变形）
// filter：每个元素 → 留下/去掉（筛选）
// forEach：每个元素 → 做件事（不关心返回值）
```

**3. 闭包（预告，第 5 步会用到）**
给每个删除按钮绑定事件时，箭头函数能"记住"它属于哪一条 todo：
```js
deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
// 这里 todo.id 被函数"记住"了 —— 这就是闭包，面试高频考点
```

## 你的任务（app.js 里 3 个 TODO）

| TODO | 做什么 | 用到的知识 |
|------|--------|-----------|
| 1 | 遍历数组渲染成 `<li>` | forEach / createElement / appendChild |
| 2 | 读取输入、校验、添加进数组 | push / trim / 空值判断 |
| 3 | 按 id 删除一条 | filter / 闭包 |

## 完成后

```bash
git add .
git commit -m "练习03完成：待办清单"
git push
```

## 加分项

1. **完成划线**：点击待办文字本身，`done` 在 true/false 之间切换，已完成的显示删除线（提示：给 li 加 class，CSS 已备好 `.done` 样式）
2. **本地保存**：刷新页面数据还在（提示：`localStorage.setItem` + `JSON.stringify`，读取用 `JSON.parse`）
3. **统计**：显示"还剩 N 件未完成"
