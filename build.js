const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const outputDir = path.join(rootDir, "public");

const files = [
  "index.html",
  "login.html",
  "result.html",
  "style.css",
  "script.js",
  "login.js",
  "firebase.js",
  "env-config.example.js"
];

fs.rmSync(outputDir, {
  force: true,
  recursive: true
});

fs.mkdirSync(outputDir, {
  recursive: true
});

for (const file of files) {
  fs.copyFileSync(
    path.join(rootDir, file),
    path.join(outputDir, file)
  );
}

console.log("Static files copied to public/");
