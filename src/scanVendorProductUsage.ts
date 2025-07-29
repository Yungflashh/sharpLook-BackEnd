import fs from "fs";
import path from "path";

const targetKeywords = ["vendor", "product"];
const targetExtensions = [".ts", ".tsx", ".js"];
const baseDir = path.join(__dirname, "services"); // 👈 Only scan ./services

const matches: { file: string; line: number; text: string }[] = [];

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    targetKeywords.forEach((keyword) => {
      if (line.includes(keyword)) {
        matches.push({ file: filePath, line: idx + 1, text: line.trim() });
      }
    });
  });
}

function walkDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (targetExtensions.includes(path.extname(file))) {
      scanFile(fullPath);
    }
  }
}

// Check if services folder exists
if (!fs.existsSync(baseDir)) {
  console.error("❌ 'services' folder not found at expected location.");
  process.exit(1);
}

walkDir(baseDir);

// Output results
if (matches.length === 0) {
  console.log("✅ No vendor or product references found in services folder.");
} else {
  console.log(`🔍 Found ${matches.length} references in 'services':\n`);
  matches.forEach((match) => {
    console.log(`📄 ${match.file} [Line ${match.line}]: ${match.text}`);
  });
}
