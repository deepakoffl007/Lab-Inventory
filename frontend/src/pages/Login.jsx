import "./Login.css";
import { useNavigate } from "react-router-dom";

function Card({ title, desc, link }) {
  const navigate = useNavigate();
  return (
    <div className="Card">
      <h2>{title}</h2>
      <p>{desc}</p>
      <button onClick={()=>navigate(link)}>ENTER PORTAL →</button>
    </div>
  );
}

export default function Login() {
  return (
    <>
      
      <div className="page">
        <div className="portal">
          <h1>LAB-INVENTORY</h1>
          <p>Select your authentication method</p>
          <div className="card-container">
            <Card title="User Access" desc="Personal-dashboard" link="/User" />

            <Card title="Admin-Access" desc="Admin-dashboard" link="/Admin" />
          </div>
        </div>
      </div>
    </>
  );
}

