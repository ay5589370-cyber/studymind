module.exports = function handler(req, res) {
  const requiredEnv = [
    "FIREBASE_API_KEY",
    "FIREBASE_AUTH_DOMAIN",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_STORAGE_BUCKET",
    "FIREBASE_MESSAGING_SENDER_ID",
    "FIREBASE_APP_ID",
    "FIREBASE_MEASUREMENT_ID",
    "GROQ_API_KEY"
  ];

  const status = {};

  for (const key of requiredEnv) {
    status[key] =
      Boolean(process.env[key]);
  }

  res.status(200).json({
    ok: Object.values(status).every(Boolean),
    env: status
  });
};
