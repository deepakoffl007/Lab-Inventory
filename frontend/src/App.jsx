import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import User from "./pages/User";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/Login" element={<Login />} />
      <Route path="/User" element={<User />} />
      <Route path="/Admin" element={<Admin />} />
      <Route path="/Dashboard" element={<Dashboard />} />

    </Routes>
  );
}
export default App;
