const fs = require("fs");
const { createCipheriv, createDecipheriv, randomBytes } = require("crypto");

const keyBase64 = process.env.ENCRYPTION_KEY_BASE64;
if (!keyBase64) {
  console.warn("⚠️  ENCRYPTION_KEY_BASE64 lipsește din .env (32 bytes Base64). Generează cu: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"");
}
const key = keyBase64 ? Buffer.from(keyBase64, "base64") : Buffer.alloc(32, 0);

function encryptToFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    input.pipe(cipher).pipe(output);

    output.on("finish", () => {
      const authTag = cipher.getAuthTag();
      resolve({ iv, authTag });
    });
    input.on("error", reject);
    output.on("error", reject);
  });
}

function decryptToStream(fileDoc, res) {
  const decipher = createDecipheriv("aes-256-gcm", key, fileDoc.iv);
  decipher.setAuthTag(fileDoc.authTag);
  const input = fs.createReadStream(fileDoc.path);
  input.pipe(decipher).pipe(res);
}

module.exports = { encryptToFile, decryptToStream };
