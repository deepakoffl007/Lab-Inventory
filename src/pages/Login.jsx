import "./Login.css";
function Card({ title, desc }) {
  return (
    <div className="Card">
      <h2>{title}</h2>
      <p>{desc}</p>
      <button>ENTER PORTAL →</button>
    </div>
  );
}

export default function Login() {
  return (
    <div className="portal">
      <h1>LAB-INVENTORY</h1>
      <p>Select your authentication method</p>
      <div className="card-container">
        <Card title="User Access" desc="Personal-dashboard" />

        <Card title="Admin-Access" desc="Admin-dashboard" />
      </div>
    </div>
  );
}

