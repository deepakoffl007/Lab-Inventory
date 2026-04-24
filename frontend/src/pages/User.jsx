import "./User.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        role: "HOD", 
      }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/Dashboard");
    } else {
      alert(data.message);
    }
  };
  return (
    <>
      <div className="back">
        <button onClick={() => navigate("/Login")}> ← BACK</button>
      </div>
      <div className="page">
        <div className="Signup">
          <h1>Admin Login</h1>
          <div className="form-row">
            <label>Name : </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Password : </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button onClick={handleLogin}>LOGIN →</button>
        </div>
      </div>
    </>
  );
}
