// ===== JSX 规则演示（把规则一条条"跑"给你看）=====
// 使用方法：在 App.jsx 里临时改成：
//     import JsxRulesDemo from './demo/JsxRulesDemo.jsx'
//     function App() { return <JsxRulesDemo /> }
// 然后保存、刷新，一边看页面一边读注释

const skills = ['JavaScript', 'CSS', 'React']

function JsxRulesDemo() {
  // ============================================================
  // 【逻辑区】= return 之前 = 普通 JS，爱怎么写怎么写
  // 变量、if、for、函数调用……全都是你练习 01~09 学过的 JS
  // ============================================================
  const name = 'Syun'                 // 变量
  const isVip = true                  // 布尔值
  const upperName = name.toUpperCase()  // 函数调用
  const skillCount = skills.length     // 属性

  let label                            // 需要 if 判断？在逻辑区用 if 算好
  if (isVip) {
    label = '⭐ VIP 用户'
  } else {
    label = '普通用户'
  }

  // ============================================================
  // 【视图区】= return 里的 JSX = 描述"页面长什么样"
  // 铁律：{} 里只能放"值"（表达式），不能放 if / for 这些"语句"
  // ============================================================
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
      <h2>JSX 规则演示</h2>

      {/* 规则 1：{} 里放变量 */}
      <p>1. 放变量：{name}</p>

      {/* 规则 2：{} 里放函数调用（函数调用的结果是一个"值"） */}
      <p>2. 放函数调用：{upperName}</p>
      <p>2b. 也可以直接调用：{name.toLowerCase()}</p>

      {/* 规则 3：{} 里放三元运算符（简易 if） */}
      <p>3. 放三元：{isVip ? '⭐ VIP 用户' : '普通用户'}</p>

      {/* 3b：逻辑复杂时，逻辑区先算好，这里只放结果 */}
      <p>3b. 逻辑区算好的：{label}</p>

      {/* 规则 4：{} 里放 map（map 的结果是一串 JSX，所以能放） */}
      <p>4. 放 map 渲染列表：</p>
      <ul>
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      {/* 规则 5：{} 里放数字、运算、属性都行 */}
      <p>5. 运算：{skillCount * 2} 个技能（{skillCount} × 2）</p>

      {/* ============================================================
          ❌ 错误示范：把下面两行的注释去掉，保存 → 页面会直接报错
          体会一下"JSX 里不能写语句"是什么意思
          ============================================================ */}
      {/* <p>{if (isVip) { 'yes' }}</p> */}
      {/* <p>{for (let i = 0; i < 3; i++) { }}</p> */}
    </div>
  )
}

export default JsxRulesDemo
