// =========================
// FIREBASE SERVICE
// =========================

window.StudyMindFirebase = (function(){

  let currentUser = null;
  let firebaseDb = null;
  let firebaseHelpers = null;
  let isFreeMode = false;
  let onHistoryLoaded = function(){};
  let onStatus = function(){};
  let onUserChanged = function(){};
  let authReadyPromise = Promise.resolve(
    null
  );

  async function init(options){

    isFreeMode =
      options.isFreeMode;

    onHistoryLoaded =
      options.onHistoryLoaded || onHistoryLoaded;

    onStatus =
      options.onStatus || onStatus;

    onUserChanged =
      options.onUserChanged || onUserChanged;

    if(
      isFreeMode
    ){

      onUserChanged(
        null
      );

      onHistoryLoaded(
        []
      );

      onStatus(
        "Free mode history is empty."
      );

      return;

    }

    try{

      const firebaseConfig =
        window.STUDYMIND_CONFIG &&
        window.STUDYMIND_CONFIG.firebase;

      if(
        !firebaseConfig ||
        !firebaseConfig.apiKey
      ){

        throw new Error(
          "Firebase config is missing. Create env-config.js from .env."
        );

      }

      const appModule =
        await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
        );

      const authModule =
        await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
        );

      firebaseHelpers =
        await import(
          "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
        );

      const app =
        appModule.initializeApp(
          firebaseConfig
        );

      const auth =
        authModule.getAuth(
          app
        );

      firebaseDb =
        firebaseHelpers.getFirestore(
          app
        );

      authReadyPromise =
        new Promise(
          function(resolve){

            authModule.onAuthStateChanged(
              auth,
              function(user){

                if(
                  !user
                ){

                  resolve(
                    null
                  );

                  window.location.href =
                    "login.html";

                  return;

                }

                currentUser =
                  user;

                onUserChanged(
                  user
                );

                resolve(
                  user
                );

                loadRecentHistory();

              }
            );

          }
        );

    }
    catch(error){

      console.error(
        error
      );

      onHistoryLoaded(
        []
      );

      onStatus(
        "Firebase could not load. Login again or check your Firebase setup."
      );

    }

  }

  async function saveActivity(activity){

    if(
      isFreeMode
    ){

      onStatus(
        "Free mode is active. History is not saved."
      );

      return {
        ok: false,
        skipped: true
      };

    }

    const user =
      currentUser ||
      await authReadyPromise;

    if(
      !user ||
      !firebaseDb ||
      !firebaseHelpers
    ){

      onStatus(
        "Login was not found. Please login again."
      );

      return {
        ok: false
      };

    }

    const {
      addDoc,
      collection,
      doc,
      serverTimestamp,
      setDoc
    } = firebaseHelpers;

    try{

      onStatus(
        "Saving activity..."
      );

      await setDoc(
        doc(
          firebaseDb,
          "users",
          user.uid
        ),
        {
          uid: user.uid,
          email: user.email || "",
          name: user.displayName || "",
          updatedAt: serverTimestamp()
        },
        {
          merge: true
        }
      );

      await addDoc(
        collection(
          firebaseDb,
          "users",
          user.uid,
          "activities"
        ),
        {
          userId: user.uid,
          userEmail: user.email || "",
          userName: user.displayName || "",
          topicName: activity.title,
          title: activity.title,
          savedBy: user.email || user.uid,
          input: activity.input,
          result: activity.result,
          language: activity.language,
          createdAt: serverTimestamp()
        }
      );

      onStatus(
        "Activity saved to database."
      );

      await loadRecentHistory();

      return {
        ok: true
      };

    }
    catch(error){

      console.warn(
        "Activity was not saved. Check Firestore rules.",
        error
      );

      onStatus(
        error.message ||
        "Database save failed. Check Firestore rules."
      );

      return {
        ok: false,
        error
      };

    }

  }

  async function loadRecentHistory(){

    if(
      isFreeMode ||
      !currentUser ||
      !firebaseDb ||
      !firebaseHelpers
    ){

      onHistoryLoaded(
        []
      );

      onStatus(
        isFreeMode
        ? "Free mode history is empty."
        : "Login mode is not ready yet. Please wait a moment."
      );

      return [];

    }

    const {
      collection,
      getDocs,
      limit,
      orderBy,
      query
    } = firebaseHelpers;

    const historyQuery =
      query(
        collection(
          firebaseDb,
          "users",
          currentUser.uid,
          "activities"
        ),
        orderBy(
          "createdAt",
          "desc"
        ),
        limit(
          30
        )
      );

    try{

      const snapshot =
        await getDocs(
          historyQuery
        );

      const history =
        snapshot.docs.map(
          function(documentSnapshot){

            return {
              id: documentSnapshot.id,
              ...documentSnapshot.data()
            };

          }
        );

      onHistoryLoaded(
        history
      );

      if(
        history.length === 0
      ){

        onStatus(
          "No saved history yet."
        );

      }
      else if(
        currentUser.email
      ){

        onStatus(
          `Showing saved topics for ${currentUser.email}`
        );

      }

      return history;

    }
    catch(error){

      console.warn(
        "History was not loaded. Check Firestore rules.",
        error
      );

      onHistoryLoaded(
        []
      );

      onStatus(
        error.message ||
        "History could not load. Check Firestore rules."
      );

      return [];

    }

  }

  function getCurrentUser(){

    return currentUser;

  }

  return {
    getCurrentUser,
    init,
    loadRecentHistory,
    saveActivity
  };

})();
