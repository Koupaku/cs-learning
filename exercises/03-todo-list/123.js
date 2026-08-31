const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');

let todos = [];

function render(){
  todoList.innerHTML = '';
  todos.forEach((todo)=> {
    const li = document.createElement('li');
    li.textContent = todo.text;

    const delBtn = document.createElement('button');
    delBtn.textContent = '删除';
    delBtn.addEventListener('click',()=>deleteTodo(todo.id));
    li.appendChild(delBtn);

    todoList.appendChild(li);
    
  });
}

function addTodo(){
  const text = todoInput.value.trim();
  if(text === ''){
    alert('不能添加空的待办！');
    return;
  };
  todos.push({ id:Date.now(), text ,done:false});
  todoInput.value = '';
  render();

}

function deleteTodo(id){
  todos = todos.filter((todo)=>todo.id !== id);
  render();
}

addBtn.addEventListener('click',addTodo);
todoInput.addEventListener('keydown',(event)=>{
  if(event.key === 'Enter'){
    addTodo();
  }
});

render();