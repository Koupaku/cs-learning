function ProfileCard({ name, title, avatar, skills }) {  //空格有规律么？能写成{ name , title , avatar , ... } 么？
    return(
        <div className="card">
            <div className="avatar">{avatar}</div>
            <h1>{name}</h1>
            <p>{title}</p>
            <div className="tags">
                {skills.map((skill) =>(
                    <span className="tag" key={skill}>{skill}</span>
                ))}
            </div>
        </div>
    )
}

export default ProfileCard