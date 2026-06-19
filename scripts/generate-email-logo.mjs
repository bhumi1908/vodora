import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const emailDir = path.join(root, "public", "email");

const iconSvg = readFileSync(path.join(emailDir, "vodora-mark.svg"), "utf8");

const iconOnlyPng = await sharp(Buffer.from(iconSvg), { density: 300 })
  .resize(16, 16)
  .png()
  .toBuffer();

writeFileSync(path.join(emailDir, "vodora-mark.png"), iconOnlyPng);

const compositeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#2563eb"/>
  ${iconSvg.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "")}
</svg>`;

const logoMarkPng = await sharp(Buffer.from(compositeSvg), { density: 300 })
  .resize(32, 32)
  .png()
  .toBuffer();

writeFileSync(path.join(emailDir, "vodora-logo-mark.png"), logoMarkPng);

console.log("Generated public/email/vodora-mark.png and vodora-logo-mark.png");
