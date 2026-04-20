import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import User from "./pages/User";
import Admin from "./pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/User" element={<User />} />
      <Route path="/Admin" element={<Admin/>}/>
    
  </Routes>
  );  
}
export default App;