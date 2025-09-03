import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" });
  const [msg, setMsg] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  async function submit(e){
    e.preventDefault();
    setMsg("");
    try {
      const { data } = await api.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      const to = loc.state?.from?.pathname || "/";
      nav(to, { replace: true });
    } catch (err) {
      setMsg(err.response?.data?.message || "Eroare la autentificare");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Autentificare</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Email" type="email"
            value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          <input className="input" placeholder="Parola" type="password"
            value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          <button className="btn w-full">Intră</button>
        </form>
        {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
        <p className="mt-4 text-sm">Nu ai cont? <Link className="text-indigo-600" to="/register">Înregistrează-te</Link></p>
      </div>
    </div>
  );
}
