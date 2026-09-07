import './App.css'
const skills = ['JavaScript','HTML/CSS','React 学习中']

function ProfileCard() {
  const name = 'Syun123'
  
  return(
    <div className='card'>
      <div className='avatar'>👨‍💻</div>
      <h1>{name}</h1>
      <p>前端开发学习者</p>
      <div className='tags'>
        {skills.map((skills) => (
          <span className='tag' key={skills}>{skills}</span>
        ))}
      </div>
    </div>
  )
}

function App() {
  return <ProfileCard /> 
}

export default App
