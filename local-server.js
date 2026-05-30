const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;

loadEnv();
writeEnvConfig();

const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async function(req, res){
  if (req.method === "GET" && req.url === "/api/env-config") {
    handleEnvConfig(req, res);
    return;
  }

  if (req.method === "OPTIONS" && req.url.startsWith("/api/")) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    });
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/groq") {
    await handleGroq(req, res);
    return;
  }

  const requestUrl = new URL(req.url, "http://localhost");
  const safePath = path.normalize(decodeURIComponent(requestUrl.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, function(error, content){
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    res.end(content);
  });
});

server.listen(process.env.PORT || 5500, function(){
  console.log(`StudyMind AI running on http://localhost:${process.env.PORT || 5500}`);
});

async function handleGroq(req, res) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    sendJson(res, 500, { error: "GROQ_API_KEY is missing in .env." });
    return;
  }

  try {
    const body = await readJson(req);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        stream: false,
        messages: body.messages || []
      })
    });

    const data = await response.json();
    sendJson(res, response.status, data);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Groq request failed." });
  }
}

function readJson(req) {
  return new Promise(function(resolve, reject){
    let body = "";

    req.on("data", function(chunk){
      body += chunk;
    });

    req.on("end", function(){
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
}

function handleEnvConfig(req, res) {
  res.writeHead(200, { "Content-Type": "text/javascript" });
  res.end(`window.STUDYMIND_CONFIG = ${JSON.stringify(getClientConfig())};`);
}

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

function writeEnvConfig() {
  fs.writeFileSync(
    path.join(rootDir, "env-config.js"),
    `window.STUDYMIND_CONFIG = ${JSON.stringify(getClientConfig(), null, 2)};\n`
  );
}

function getClientConfig() {
  return {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      projectId: process.env.FIREBASE_PROJECT_ID || "",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.FIREBASE_APP_ID || "",
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
    },
    groqApiKey: process.env.GROQ_API_KEY || "",
    groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
  };
}
