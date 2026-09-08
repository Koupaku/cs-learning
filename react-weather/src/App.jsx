//http://127.0.0.1:5173
//npm run dev -- --host 127.0.0.1
import './App.css'
import ProfileCard from './components/ProfileCard.jsx'

function App() {
  //return里有很多<>  </>都是必须的么？ 怎么写的？
  return(
    <>
      <ProfileCard
        name="Syun"
        title="前端开发学习者"
        avatar="👨‍💻"
        skills={['JavaScript', 'HTML/CSS', 'React 学习中']}
        />
      <ProfileCard
      name="小明"
        title="UI 设计师"
        avatar="🎨"
        skills={['Figma', 'Photoshop', '插画']}
      />
    </>
  )
}

export default App
