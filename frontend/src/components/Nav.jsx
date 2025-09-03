export default function Nav() {
  function logout() {
    localStorage.removeItem("token");
    location.href = "/login";
  }
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">🔐 Secure File Sharing</h1>
        <button onClick={logout} className="btn">Logout</button>
      </div>
    </header>
  );
}
