# 练习 08：待办清单 v2 📝（React 预备课）

> 主题：展开运算符 `...` + **不可变性**（React 最重要的一条规矩）
> 难度：入门+ · 预计 2~3 小时
> 意义：**做完这一课，你就提前学会了 React 的核心数据操作模式**。
> 新零件打样：`notes/08-展开与不可变性打样/`（必看！）

---

## 升级点（对比练习 03）

1. 每条待办多一个 **✓完成/↩恢复** 按钮 → 点它，文字划线/恢复
2. 底部统计：**还剩 N 件未完成**
3. 添加改用展开运算符（不可变性写法）

## 核心思想：不可变性（immutability）

**规矩：更新数据 = 造一个新的，旧的一律不碰。**

```js
todos = [...todos, newTodo];                                  // 添加
todos = todos.filter(t => t.id !== id);                       // 删除
todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);  // 修改 ★
```

为什么 React 要求这样？因为"直接改旧数组"会通过**别名**（打样零件 1）偷偷改到别的地方，页面状态就乱了。以后你在 React 里写的 `setTodos(...)` 里装的就是这三行。

## 新概念速览

```js
const copy = [...oldArray];        // 摊开复制
const updated = { ...obj, done: true };   // 照抄对象，覆盖某属性
// map 里：命中的造新的，没命中的原样返回
```

## 你的任务（app.js 2 个 TODO + style.css 2 个 TODO）

| TODO | 做什么 |
|------|--------|
| app.js TODO 1 | `toggleDone(id)`：map + 展开 + 三元翻转 done（打样零件 4 原样） |
| app.js TODO 2 | render 里用 filter 算 `left`，更新 `#stats` 文字 |
| style.css TODO 1 | `li.done span` 加删除线 + 变灰 |
| style.css TODO 2 | `#stats` 浅色、小字、居中 |

## 验收标准

- [ ] 添加几条待办，点 ✓ → 文字划线变灰，按钮变"↩ 恢复"
- [ ] 点 ↩ → 恢复原样
- [ ] 统计数字跟着变（完成一件就少一件）
- [ ] 删除、空输入提示（v1 功能不退化）

## 完成后

```bash
git add .
git commit -m "练习08完成：待办清单v2（不可变性）"
git push
```

## 加分项

1. **本地保存**：刷新页面数据还在 —— `localStorage.setItem('todos', JSON.stringify(todos))`，每次 render 后保存；开局时读回来（`JSON.parse`）
2. **全部完成按钮**：一键把所有 done 设为 true（提示：map 全量替换）
3. **清空已完成**：一键删掉所有 done 为 true 的（提示：filter !done）
