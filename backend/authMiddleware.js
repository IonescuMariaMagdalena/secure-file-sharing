const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Token lipsă" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, username }
    next();
  } catch {
    res.status(401).json({ message: "Token invalid sau expirat" });
  }
}

module.exports = auth;
