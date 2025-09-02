import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username:"", password:"" });
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      nav("/");
    } catch (e) {
      setMsg(e.response?.data?.message || "Eroare");
    }
  }

  return (
    <div style={{ maxWidth:480, margin:"3rem auto" }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Username" value={form.username}
          onChange={e=>setForm({...form, username:e.target.value})} required />
        <input placeholder="Parola" type="password" value={form.password}
          onChange={e=>setForm({...form, password:e.target.value})} required />
        <button>Intră</button>
      </form>
      <p>{msg}</p>
      <a href="/register">Nu ai cont? Register</a>
    </div>
  );
}
