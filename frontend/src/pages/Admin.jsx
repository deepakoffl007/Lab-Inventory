import "./Admin.css"

import { useState } from "react";
import {useNavigate} from "react-router-dom"
export default function Admin() {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleLogin = () => {
        if (name === "admin" && password === "1234") {
            navigate("/");
        }
        else {
            setError("Invalid Username or Password");
        }
    };
  return (
    <div className="page">
      <div className="Signup">
        <h1>Admin Login</h1>
        <div className="form-row">
          <label>Name : </label>
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button onClick={handleLogin}>LOGIN →</button>
      </div>
    </div>
  );
}
