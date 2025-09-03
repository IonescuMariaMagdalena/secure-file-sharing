import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function Private({ children }) {
  const token = localStorage.getItem("token");
  const loc = useLocation();
  return token ? children : <Navigate to="/login" state={{ from: loc }} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Private><Dashboard/></Private>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
