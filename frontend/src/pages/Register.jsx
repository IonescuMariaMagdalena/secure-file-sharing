import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ username:"", email:"", password:"" });
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/api/auth/register", form);
      setMsg("Cont creat. Te poți autentifica.");
      setTimeout(()=> nav("/login"), 600);
    } catch (err) {
      setMsg(err.response?.data?.message || "Eroare la înregistrare");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Creează cont</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Username"
            value={form.username} onChange={e=>setForm({...form, username:e.target.value})}/>
          <input className="input" placeholder="Email" type="email"
            value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          <input className="input" placeholder="Parola" type="password"
            value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <button className="btn w-full">Înregistrează-te</button>
        </form>
        {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
        <p className="mt-4 text-sm">Ai deja cont? <Link className="text-indigo-600" to="/login">Login</Link></p>
      </div>
    </div>
  );
}
