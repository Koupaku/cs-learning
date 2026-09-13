import { useState } from "react";


function TodoApp() {
    const [todos, setTodos] = useState([
        { id: 1, text:'买牛奶', done: false },
        { id: 2, text:'买水果', done: false },
        { id: 3, text:'买蔬菜', done: false },
    ]);
    
    const [input, setInput] = useState('');
    
    function addTodo() {
        if (input.trim() === '') return
        setTodos([...todos, { id:Date.now(), text:input, done: false}])
        setInput('')
    }
    //能写成setTodos(prev =>({...prev,{ id:Date.now(), text:input, done: false}}))嘛？;
 //这里addTodo传进来的数是input？ 怎么和input联系上的？

    function deleteTodo(id) {
        setTodos(todos.filter((todo) => todo.id !== id))
    }
//筛掉id正确的（目标），留下……

    function toggleDone(id) {
        setTodos(todos.map((todo) =>
        todo.id === id ? {...todo, done: !todo.done} : todo))
    }
//遍历todos找到相同id的{},把它的done属性反转，否则不变。

    const leftCount = todos.filter((todo) => !todo.done).length
    
    return(
        <div className="todo-app">
            <h1>待办清单</h1>

            <div className="input-row">
                <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="要做什么？" 
                />

            <button onClick={addTodo}>添加</button>
            </div>

            <ul>
                {todos.map((todo) =>(
                    <li key={todo.id} className={todo.done ? 'done' : ''}>
                        <button onClick={() => toggleDone(todo.id)}>√</button> 
                        <span>{todo.text}</span>
                        
                        <button onClick={() => deleteTodo(todo.id)}>删除</button>
                    </li>
                    
                ))}
            </ul>
            <p className="stats">还剩 {leftCount} 件未完成</p>
            
        </div>
    )
}


export default TodoApp