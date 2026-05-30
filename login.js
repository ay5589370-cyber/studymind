import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const authForm = document.getElementById("authForm");
const authSubmit = document.getElementById("authSubmit");
const authMessage = document.getElementById("authMessage");
const nameGroup = document.getElementById("nameGroup");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPassword = document.getElementById("userPassword");
const googleLogin = document.getElementById("googleLogin");

let authMode = "login";
let auth = null;
let db = null;
let provider = null;

initLogin();

function initLogin() {
  wireUI();

  try {
    const firebaseConfig = getFirebaseConfig();

    if (!firebaseConfig) {
      setAuthReady(false);
      showMessage("Firebase config is missing. Check Vercel Environment Variables, then redeploy.", "error");
      return;
    }

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account"
    });

    setAuthReady(true);
    showMessage("", "info");
  } catch (error) {
    setAuthReady(false);
    showMessage(getAuthErrorMessage(error), "error");
    console.error(error);
  }
}

function wireUI() {
  loginTab.addEventListener("click", function() {
    setMode("login");
  });

  registerTab.addEventListener("click", function() {
    setMode("register");
  });

  authForm.addEventListener("submit", handleEmailAuth);
  googleLogin.addEventListener("click", handleGoogleAuth);
  setMode("login");
}

function setAuthReady(isReady) {
  authSubmit.disabled = !isReady;
  googleLogin.disabled = !isReady;
}

function getFirebaseConfig() {
  const config =
    window.STUDYMIND_CONFIG &&
    window.STUDYMIND_CONFIG.firebase;

  const requiredKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "appId"
  ];

  const isValid =
    config &&
    requiredKeys.every(function(key) {
      return config[key] && String(config[key]).trim() !== "";
    });

  return isValid ? config : null;
}

function setMode(mode) {
  authMode = mode;
  const isRegister = mode === "register";

  loginTab.classList.toggle("active", !isRegister);
  registerTab.classList.toggle("active", isRegister);
  nameGroup.style.display = isRegister ? "block" : "none";
  userName.required = isRegister;
  authSubmit.textContent = isRegister ? "Create Account" : "Login";
  authMessage.textContent = "";
}

function showMessage(message, type) {
  authMessage.textContent = message;
  authMessage.className = `auth-message ${type}`;
}

function goToApp(user) {
  localStorage.setItem("studyMindUser", JSON.stringify({
    uid: user.uid,
    name: user.displayName || "",
    email: user.email
  }));

  window.location.href = "result.html";
}

async function saveUserProfile(user) {
  await setDoc(
    doc(db, "users", user.uid),
    {
      uid: user.uid,
      name: user.displayName || userName.value.trim() || "",
      email: user.email,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

async function trySaveUserProfile(user) {
  try {
    await saveUserProfile(user);
  } catch (error) {
    console.warn("Profile was not saved. Check Firestore rules.", error);
  }
}

async function handleEmailAuth(event) {
  event.preventDefault();

  if (!auth) {
    showMessage("Firebase is not ready. Check Vercel Environment Variables.", "error");
    return;
  }

  authSubmit.disabled = true;
  showMessage("Please wait...", "info");

  try {
    if (authMode === "register") {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail.value.trim(),
        userPassword.value
      );

      if (userName.value.trim() !== "") {
        await updateProfile(userCredential.user, {
          displayName: userName.value.trim()
        });
      }

      await trySaveUserProfile(userCredential.user);
      goToApp(userCredential.user);
      return;
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      userEmail.value.trim(),
      userPassword.value
    );

    await trySaveUserProfile(userCredential.user);
    goToApp(userCredential.user);
  } catch (error) {
    showMessage(getAuthErrorMessage(error), "error");
    console.error(error);
  } finally {
    authSubmit.disabled = false;
  }
}

async function handleGoogleAuth() {
  if (!auth || !provider) {
    showMessage("Firebase is not ready. Check Vercel Environment Variables.", "error");
    return;
  }

  googleLogin.disabled = true;
  showMessage("Opening Google sign in...", "info");

  try {
    const userCredential = await signInWithPopup(auth, provider);
    await trySaveUserProfile(userCredential.user);
    goToApp(userCredential.user);
  } catch (error) {
    showMessage(getAuthErrorMessage(error), "error");
    console.error(error);
  } finally {
    googleLogin.disabled = false;
  }
}

function getAuthErrorMessage(error) {
  const code = error.code || "";

  if (code === "auth/unauthorized-domain") {
    return "This Vercel domain is not authorized in Firebase. Add this exact domain in Firebase Authentication > Settings > Authorized domains.";
  }

  if (code === "auth/operation-not-allowed") {
    return "This sign-in method is disabled in Firebase. Enable Email/Password and Google sign-in.";
  }

  if (code === "auth/invalid-api-key" || code === "auth/api-key-not-valid") {
    return "Firebase API key is invalid. Check FIREBASE_API_KEY in Vercel Environment Variables.";
  }

  if (code === "auth/configuration-not-found") {
    return "Firebase Auth configuration was not found. Check your Firebase project and Authentication setup.";
  }

  if (code === "auth/invalid-credential") {
    return "Invalid email or password.";
  }

  if (code === "permission-denied") {
    return "Firestore permission denied. Publish the Firestore rules from this project.";
  }

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in popup was closed before login completed.";
  }

  if (code === "auth/popup-blocked") {
    return "Browser blocked the Google sign-in popup. Allow popups for this site.";
  }

  return (error.message || "Authentication failed.").replace("Firebase: ", "");
}
