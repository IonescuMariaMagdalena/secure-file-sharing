import { useState } from "react";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const response = await api.post("/auth/register", form);
      setMsg(`✅ Cont creat: ${response.data.message}`);
      setForm({ username: "", email: "", password: "" }); // reset form
    } catch (err) {
      console.error(err); // arată detaliile erorii în consolă
      setMsg(err.response?.data?.message || "❌ Eroare la crearea contului");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "3rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Parola"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Se creează contul..." : "Crează cont"}
        </button>
      </form>
      {msg && <p style={{ marginTop: "1rem" }}>{msg}</p>}
      <a href="/login">Ai cont? Login</a>
    </div>
  );
}
