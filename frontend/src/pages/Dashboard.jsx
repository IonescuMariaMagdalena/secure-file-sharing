import { useEffect, useState } from "react";
import api from "../api";
import Nav from "../components/Nav";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/api/files");
      setFiles(data);
    } catch {
      setMsg("Eroare la încărcarea listei de fișiere");
    }
  }

  useEffect(() => { load(); }, []);

  async function onUpload(e) {
    e.preventDefault();
    const f = e.target.file?.files?.[0];
    if (!f) return;
    try {
      const fd = new FormData();
      fd.append("file", f);
      await api.post("/api/files/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg("Fișier încărcat & criptat ✅");
      e.target.reset();
      load();
    } catch {
      setMsg("Eroare la upload");
    }
  }

  function download(id, name="file") {
    const url = `${import.meta.env.VITE_API_URL}/api/files/${id}/download`;
    const token = localStorage.getItem("token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error("Download failed");
        return r.blob();
      })
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(()=> setMsg("Eroare la download"));
  }

  async function share(id) {
  try {
    const { data } = await api.post(`/api/files/${id}/share`, { ttlMinutes: 30 });

    // dacă backend-ul returnează deja URL absolut, nu mai adăugăm nimic
    const full = data.url;  

    await navigator.clipboard.writeText(full);
    setMsg(`Link copiat (expiră la ${new Date(data.expiresAt).toLocaleString()})`);
  } catch {
    setMsg("Eroare la share");
  }
}


  return (
    <>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="card mb-6">
          <h2 className="text-xl font-semibold mb-3">Upload fișier (va fi criptat AES-256-GCM)</h2>
          <form onSubmit={onUpload} className="flex items-center gap-3">
            <input name="file" type="file" className="input" />
            <button className="btn">Upload</button>
          </form>
          {msg && <p className="mt-3 text-sm text-gray-600">{msg}</p>}
        </section>

        <section className="card">
          <h3 className="text-lg font-semibold mb-3">Fișierele tale</h3>
          {files.length === 0 ? (
            <p className="text-sm text-gray-500">Nu ai încărcat încă fișiere.</p>
          ) : (
            <ul className="divide-y">
              {files.map(f => (
                <li key={f._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{f.originalName || "file"}</div>
                    <div className="text-xs text-gray-500">
                      {(f.size/1024).toFixed(1)} KB • {new Date(f.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn" onClick={()=>download(f._id, f.originalName)}>Download</button>
                    <button className="btn" onClick={()=>share(f._id)}>Share (30m)</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
