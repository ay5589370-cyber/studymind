window.STUDYMIND_CONFIG = {
  firebase: {
    apiKey: "your_firebase_api_key",
    authDomain: "your_project.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project.firebasestorage.app",
    messagingSenderId: "your_sender_id",
    appId: "your_firebase_app_id",
    measurementId: "your_measurement_id"
  }
};

// Optional Groq settings for direct client calls (not recommended for public repos)
// Add these to your committed env-config.js if you want the client to call Groq directly.
// Example:
// window.STUDYMIND_CONFIG.groqApiKey = "your_groq_api_key";
// window.STUDYMIND_CONFIG.groqModel = "llama-3.3-70b-versatile";
