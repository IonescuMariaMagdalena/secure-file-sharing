import fs from "fs";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const key = Buffer.from(process.env.ENCRYPTION_KEY_BASE64, "base64");

export function encryptToFile(inputPath, outputPath) {
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
    output.on("error", reject);
    input.on("error", reject);
  });
}

export function decryptToStream(fileDoc, res) {
  const decipher = createDecipheriv("aes-256-gcm", key, fileDoc.iv);
  decipher.setAuthTag(fileDoc.authTag);
  const input = fs.createReadStream(fileDoc.path);
  input.pipe(decipher).pipe(res);
  return input;
}
