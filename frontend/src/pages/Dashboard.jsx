import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [msg, setMsg] = useState("");

  async function load(){
    const { data } = await api.get("/files");
    setFiles(data);
  }
  useEffect(()=>{ load(); },[]);

  async function upload(e){
    e.preventDefault();
    const f = e.target.file.files[0];
    if(!f) return;
    const fd = new FormData();
    fd.append("file", f);
    await api.post("/files/upload", fd, { headers: { "Content-Type":"multipart/form-data" }});
    setMsg("Încărcat!");
    load();
  }

  function download(id){
    const url = `${import.meta.env.VITE_API_URL}/files/${id}/download`;
    const token = localStorage.getItem("token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.blob()).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "file";
        a.click();
      });
  }

  async function share(id){
    const { data } = await api.post(`/files/${id}/share`, { ttlMinutes: 30 });
    const full = `${window.location.origin}${data.url.replace('/api','')}`;
    navigator.clipboard.writeText(full);  // folosești variabila
    setMsg(`Link copiat (expiră la ${new Date(data.expiresAt).toLocaleString()})`);
  }

  function logout(){
    localStorage.removeItem("token");
    location.href = "/login";
  }

  return (
    <div style={{ maxWidth:800, margin:"2rem auto" }}>
      <h2>Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <form onSubmit={upload} style={{ marginTop:"1rem" }}>
        <input name="file" type="file" />
        <button>Upload</button>
      </form>
      <p>{msg}</p>
      <h3>Fișierele tale</h3>
      <ul>
        {files.map(f => (
          <li key={f._id}>
            {f.originalName || "file"} — {(f.size/1024).toFixed(1)} KB — {new Date(f.createdAt).toLocaleString()}
            <button onClick={()=>download(f._id)} style={{ marginLeft:8 }}>Download</button>
            <button onClick={()=>share(f._id)} style={{ marginLeft:8 }}>Share (30m)</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
