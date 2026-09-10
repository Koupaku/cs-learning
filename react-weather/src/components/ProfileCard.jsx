import { useState } from "react";

function ProfileCard({ name, title, avatar, skills }) {
    const [likes,setLikes] = useState(0)

    return (
        <div className="card">
            <div className="avatar">{avatar}</div>
            <h1>{name}</h1>
            <p>{title}</p>
            <div className="tags">
                {skills.map((skill) => (
                    <span className="tag" key={skill}>{skill}</span>
                ))}
            </div>
            <button className="like-btn" onClick={() => setLikes(likes +1)}>
                ❤️ {likes}
            </button>

        </div>
    )
}

export default ProfileCard
