const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const outputDir = path.join(rootDir, "public");

loadEnv();

const files = [
  "index.html",
  "login.html",
  "privacy.html",
  "result.html",
  "terms.html",
  "style.css",
  "script.js",
  "login.js",
  "firebase.js",
  "nexora.png",
  "nexoralogo.png"
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

const clientConfig = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.FIREBASE_APP_ID || "",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
  },
  debug: {
    hasFirebaseApiKey: Boolean(process.env.FIREBASE_API_KEY),
    hasFirebaseProjectId: Boolean(process.env.FIREBASE_PROJECT_ID),
    hasFirebaseAppId: Boolean(process.env.FIREBASE_APP_ID)
  }
};

fs.writeFileSync(
  path.join(outputDir, "env-config.js"),
  `window.STUDYMIND_CONFIG = ${JSON.stringify(clientConfig, null, 2)};\n`
);

console.log("Static files copied to public/");

function loadEnv() {
  const envPath = path.join(rootDir, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trim().startsWith("#") || !line.includes("=")) {
      continue;
    }

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}
