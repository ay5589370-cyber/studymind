// =========================
// CURRENT PAGE
// =========================

const currentPage =
  window.location.pathname;



// =========================
// RESULT PAGE CODE
// =========================

if(
  currentPage.includes("result.html")
){

  // =========================
  // ELEMENTS
  // =========================
  const fileName =
  document.getElementById(
    "fileName"
  );

  const fileInput =
    document.getElementById(
      "fileInput"
    );

  const notesInput =
    document.getElementById(
      "notes"
    );

  const explainBtn =
    document.getElementById(
      "explainBtn"
    );

  const languageSelect =
    document.getElementById(
      "language"
    );

  const resultBox =
    document.getElementById(
      "resultBox"
    );

  const loadingText =
    document.getElementById(
      "loadingText"
    );

  const downloadBtn =
    document.getElementById(
      "downloadBtn"
    );

  const voiceBtn =
    document.getElementById(
      "voiceBtn"
    );

  const themeToggle =
    document.getElementById(
      "themeToggle"
    );

  const newTopicBtn =
    document.getElementById(
      "newTopicBtn"
    );

  const sidebar =
    document.querySelector(
      ".sidebar"
    );

  const sidebarOverlay =
    document.getElementById(
      "sidebarOverlay"
    );

  const mobileSidebarToggle =
    document.getElementById(
      "mobileSidebarToggle"
    );

  const profileAvatar =
    document.getElementById(
      "profileAvatar"
    );

  const profileName =
    document.getElementById(
      "profileName"
    );

  const profileEmail =
    document.getElementById(
      "profileEmail"
    );

  const recentList =
    document.getElementById(
      "recentList"
    );

  const recentScrollUp =
    document.getElementById(
      "recentScrollUp"
    );

  const recentScrollDown =
    document.getElementById(
      "recentScrollDown"
    );

  const pageParams =
    new URLSearchParams(
      window.location.search
    );

  const isFreeMode =
    pageParams.get("mode") === "free";

  let localHistory = [];
  let typingTimer = null;
  let currentSpeech = null;
  let speechQueue = [];
  let speechQueueIndex = 0;


  // =========================
  // STORE PDF TEXT
  // =========================

  let extractedText = "";

  // =========================
  // FIREBASE AUTH + HISTORY
  // =========================

  setupStudyMindFirebase();

  function openMobileSidebar(){

    if(
      !sidebar ||
      !sidebarOverlay
    ){

      return;

    }

    sidebar.classList.add(
      "open"
    );

    sidebarOverlay.classList.add(
      "show"
    );

  }

  function closeMobileSidebar(){

    if(
      !sidebar ||
      !sidebarOverlay
    ){

      return;

    }

    sidebar.classList.remove(
      "open"
    );

    sidebarOverlay.classList.remove(
      "show"
    );

  }

  if(
    mobileSidebarToggle
  ){

    mobileSidebarToggle.addEventListener(
      "click",
      openMobileSidebar
    );

  }

  if(
    sidebarOverlay
  ){

    sidebarOverlay.addEventListener(
      "click",
      closeMobileSidebar
    );

  }

  function setupStudyMindFirebase(){

    if(
      !window.StudyMindFirebase
    ){

      renderRecentItems(
        []
      );

      showHistoryStatus(
        "Firebase file could not load."
      );

      return;

    }

    window.StudyMindFirebase.init(
      {
        isFreeMode,
        onUserChanged: updateProfileUI,
        onHistoryLoaded: function(history){

          localHistory =
            history;

          renderRecentItems(
            history
          );

        },
        onStatus: showHistoryStatus
      }
    );

  }

  function updateProfileUI(
    user
  ){

    if(
      isFreeMode ||
      !user
    ){

      profileAvatar.innerText =
        "G";

      profileName.innerText =
        "Guest";

      profileEmail.innerText =
        "Free mode";

      return;

    }

    const displayName =
      user.displayName ||
      "Student";

    profileAvatar.innerText =
      displayName
      .charAt(0)
      .toUpperCase();

    profileName.innerText =
      displayName;

    profileEmail.innerText =
      user.email || "";

  }

  function getHistoryTitle(
    studyText
  ){

    if(
      fileName.innerText.trim() !== ""
    ){

      return fileName.innerText.trim();

    }

    const words =
      studyText
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join(" ");

    return words || "Study Topic";

  }

  async function saveActivity(
    studyText,
    aiExplanation
  ){

    if(
      !window.StudyMindFirebase
    ){

      showHistoryStatus(
        "Firebase file could not load."
      );

      return;

    }

    const activity =
      {
        title: getHistoryTitle(
          studyText
        ),
        input: studyText,
        result: aiExplanation,
        language: languageSelect.value
      };

    const saveResult =
      await window.StudyMindFirebase.saveActivity(
        activity
      );

    if(
      saveResult.ok
    ){

      return;

    }

    if(
      saveResult.skipped
    ){

      return;

    }

    localHistory.unshift(
      activity
    );

    renderRecentItems(
      localHistory
    );

    showHistoryStatus(
      saveResult.error?.message ||
      "Database save failed. Check Firestore rules."
    );

  }

  async function loadRecentHistory(){

    if(
      !window.StudyMindFirebase
    ){

      renderRecentItems(
        []
      );

      showHistoryStatus(
        "Firebase file could not load."
      );

      return;

    }

    const history =
      await window.StudyMindFirebase.loadRecentHistory(
      );

    localHistory =
      history;

  }

  function showHistoryStatus(
    message
  ){

    if(
      !recentList
    ){

      return;

    }

    recentList.dataset.status =
      message;

    console.info(
      message
    );

  }

  function renderRecentItems(
    history
  ){

    if(
      history.length === 0
    ){

      recentList.innerHTML =
        '<div class="recent-empty">No history yet.</div>';

      if(
        recentList.dataset.status
      ){

        recentList.innerHTML =
          `<div class="recent-empty">${recentList.dataset.status}</div>`;

      }

      return;

    }

    recentList.innerHTML = "";

    history.forEach(
      function(item){

        const recentItem =
          document.createElement(
            "div"
          );

        recentItem.className =
          "recent-item";

        const title =
          item.topicName ||
          item.title ||
          "Study Topic";

        recentItem.textContent =
          title;

        const recentLanguage =
          document.createElement(
            "small"
          );

        recentLanguage.textContent =
          `${item.language || "English"}${item.userEmail ? " | " + item.userEmail : ""}`;

        recentItem.appendChild(
          recentLanguage
        );

        recentItem.addEventListener(
          "click",
          function(){

            notesInput.value =
              item.input || "";

            resultBox.innerText =
              item.result || "";

            localStorage.setItem(
              "aiExplanation",
              item.result || ""
            );

            closeMobileSidebar();

          }
        );

        recentList.appendChild(
          recentItem
        );

      }
    );

  }

  function stopTypingAnimation(){

    if(
      typingTimer
    ){

      clearTimeout(
        typingTimer
      );

      typingTimer = null;

    }

  }

  function typeAIResponse(
    text,
    onComplete
  ){

    stopTypingAnimation();

    resultBox.innerText =
      "";

    let index = 0;

    function typeNextChunk(){

      const chunkSize =
        text.length > 1200
        ? 8
        : 4;

      resultBox.innerText +=
        text.slice(
          index,
          index + chunkSize
        );

      index +=
        chunkSize;

      resultBox.scrollTop =
        resultBox.scrollHeight;

      if(
        index < text.length
      ){

        typingTimer =
          setTimeout(
            typeNextChunk,
            16
          );

        return;

      }

      typingTimer = null;

      if(
        onComplete
      ){

        onComplete();

      }

    }

    typeNextChunk();

  }

  function getSpeechLanguage(){

    const selectedLanguage =
      languageSelect.value;

    const aiExplanation =
      localStorage.getItem(
        "aiExplanation"
      ) ||
      resultBox.innerText.trim();

    const hasDevanagari =
      /[\u0900-\u097F]/.test(
        aiExplanation
      );

    if(
      selectedLanguage === "Hindi"
    ){

      return hasDevanagari
      ? "hi-IN"
      : "en-IN";

    }

    if(
      selectedLanguage === "Nepali"
    ){

      return hasDevanagari
      ? "hi-IN"
      : "en-IN";

    }

    return "en-US";

  }

  function updateVoiceButton(
    isSpeaking
  ){

    if(
      !voiceBtn
    ){

      return;

    }

    voiceBtn.innerHTML =
      isSpeaking
      ? '<i class="fa-solid fa-stop"></i>'
      : '<i class="fa-solid fa-volume-high"></i>';

    voiceBtn.title =
      isSpeaking
      ? "Stop response"
      : "Play response";

  }

  function chooseReaderVoice(
    languageCode
  ){

    if(
      !window.speechSynthesis
    ){

      return null;

    }

    const voices =
      window.speechSynthesis.getVoices();

    const languageVoices =
      voices.filter(
        function(voice){

          return voice.lang
            .toLowerCase()
            .startsWith(
              languageCode
                .slice(0, 2)
                .toLowerCase()
            );

        }
      );

    const indianEnglishVoices =
      voices.filter(
        function(voice){

          return voice.lang
            .toLowerCase() === "en-in";

        }
      );

    return (
      languageVoices.find(
        function(voice){

          const voiceName =
            voice.name.toLowerCase();

          return (
            voiceName.includes("female") ||
            voiceName.includes("woman") ||
            voiceName.includes("zira") ||
            voiceName.includes("samantha") ||
            voiceName.includes("heera") ||
            voiceName.includes("lekha") ||
            voiceName.includes("google हिन्दी") ||
            voiceName.includes("google hindi") ||
            voiceName.includes("google indian english") ||
            voiceName.includes("google uk english female")
          );

        }
      ) ||
      indianEnglishVoices.find(
        function(voice){

          const voiceName =
            voice.name.toLowerCase();

          return (
            voiceName.includes("female") ||
            voiceName.includes("woman") ||
            voiceName.includes("heera") ||
            voiceName.includes("lekha") ||
            voiceName.includes("google")
          );

        }
      ) ||
      languageVoices[0] ||
      indianEnglishVoices[0] ||
      voices.find(
        function(voice){

          return voice.lang
            .toLowerCase()
            .startsWith("en");

        }
      ) ||
      null
    );

  }

  function prepareSpeechText(
    text
  ){

    return text
      .replace(
        /[#*_`>]+/g,
        ""
      )
      .replace(
        /\s*[-•]\s+/g,
        ". "
      )
      .replace(
        /\s+/g,
        " "
      )
      .replace(
        /([.!?])\s+/g,
        "$1 "
      )
      .trim();

  }

  function getSpeechRate(){

    const selectedLanguage =
      languageSelect.value;

    if(
      selectedLanguage === "Hindi" ||
      selectedLanguage === "Nepali"
    ){

      return 0.86;

    }

    return 1;

  }

  function chooseHumanReaderVoice(
    languageCode
  ){

    if(
      !window.speechSynthesis
    ){

      return null;

    }

    const voices =
      window.speechSynthesis.getVoices();

    const preferredVoices =
      voices.filter(
        function(voice){

          const voiceLanguage =
            voice.lang.toLowerCase();

          return (
            voiceLanguage === languageCode.toLowerCase() ||
            voiceLanguage === "en-in" ||
            voiceLanguage.startsWith("en")
          );

        }
      );

    let bestVoice = null;
    let bestScore = -1;

    preferredVoices.forEach(
      function(voice){

        const voiceName =
          voice.name.toLowerCase();

        const voiceLanguage =
          voice.lang.toLowerCase();

        let score = 0;

        if(
          voiceLanguage === languageCode.toLowerCase()
        ){

          score += 20;

        }

        if(
          voiceLanguage === "en-in"
        ){

          score += 18;

        }

        if(
          voiceName.includes("natural") ||
          voiceName.includes("neural") ||
          voiceName.includes("premium") ||
          voiceName.includes("online")
        ){

          score += 34;

        }

        if(
          voiceName.includes("google") ||
          voiceName.includes("microsoft")
        ){

          score += 14;

        }

        if(
          voiceName.includes("female") ||
          voiceName.includes("woman") ||
          voiceName.includes("zira") ||
          voiceName.includes("samantha") ||
          voiceName.includes("heera") ||
          voiceName.includes("lekha") ||
          voiceName.includes("sonia") ||
          voiceName.includes("aria") ||
          voiceName.includes("jenny")
        ){

          score += 12;

        }

        if(
          !voice.localService
        ){

          score += 6;

        }

        if(
          score > bestScore
        ){

          bestScore = score;
          bestVoice = voice;

        }

      }
    );

    return bestVoice ||
      preferredVoices[0] ||
      voices[0] ||
      null;

  }

  function splitSpeechText(
    text
  ){

    const cleanText =
      prepareSpeechText(
        text
      )
      .replace(
        /\s*-\s+/g,
        ". "
      )
      .replace(
        /(\d+)\.\s+/g,
        ". Point $1. "
      );

    const sentences =
      cleanText.match(
        /[^.!?]+[.!?]+|[^.!?]+$/g
      ) || [cleanText];

    const chunks = [];
    let currentChunk = "";

    sentences.forEach(
      function(sentence){

        const trimmedSentence =
          sentence.trim();

        if(
          !trimmedSentence
        ){

          return;

        }

        if(
          (
            currentChunk + " " + trimmedSentence
          ).trim().length > 220
        ){

          if(
            currentChunk
          ){

            chunks.push(
              currentChunk.trim()
            );

          }

          currentChunk =
            trimmedSentence;

          return;

        }

        currentChunk =
          (
            currentChunk + " " + trimmedSentence
          ).trim();

      }
    );

    if(
      currentChunk
    ){

      chunks.push(
        currentChunk.trim()
      );

    }

    return chunks;

  }

  function stopVoiceResponse(){

    if(
      window.speechSynthesis
    ){

      window.speechSynthesis.cancel();

    }

    currentSpeech = null;
    speechQueue = [];
    speechQueueIndex = 0;
    updateVoiceButton(false);

  }

  function speakNextChunk(
    languageCode,
    readerVoice
  ){

    if(
      speechQueueIndex >= speechQueue.length
    ){

      currentSpeech = null;
      speechQueue = [];
      speechQueueIndex = 0;
      updateVoiceButton(false);
      return;

    }

    const utterance =
      new SpeechSynthesisUtterance(
        speechQueue[speechQueueIndex]
      );

    utterance.lang =
      languageCode;

    utterance.rate =
      getSpeechRate();

    utterance.pitch =
      languageCode === "en-IN"
      ? 1.03
      : 1;

    utterance.volume = 1;

    if(
      readerVoice
    ){

      utterance.voice =
        readerVoice;

    }

    utterance.onend =
      function(){

        speechQueueIndex += 1;

        setTimeout(
          function(){

            speakNextChunk(
              languageCode,
              readerVoice
            );

          },
          120
        );

      };

    utterance.onerror =
      function(){

        currentSpeech = null;
        speechQueue = [];
        speechQueueIndex = 0;
        updateVoiceButton(false);

      };

    currentSpeech =
      utterance;

    window.speechSynthesis.speak(
      utterance
    );

  }

  function playVoiceResponse(){

    if(
      !window.speechSynthesis
    ){

      alert(
        "Voice playback is not supported in this browser."
      );

      return;

    }

    if(
      window.speechSynthesis.speaking
    ){

      stopVoiceResponse();
      return;

    }

    const aiExplanation =
      localStorage.getItem(
        "aiExplanation"
      ) ||
      resultBox.innerText.trim();

    if(
      !aiExplanation
    ){

      alert(
        "Please generate an AI response first."
      );

      return;

    }

    const languageCode =
      getSpeechLanguage();

    const utterance =
      new SpeechSynthesisUtterance(
        prepareSpeechText(
          aiExplanation
        )
      );

    utterance.lang =
      languageCode;

    utterance.rate =
      getSpeechRate();

    utterance.pitch = 1;
    utterance.volume = 1;

    const readerVoice =
      chooseReaderVoice(
        languageCode
      );

    if(
      readerVoice
    ){

      utterance.voice =
        readerVoice;

    }

    utterance.onend =
      function(){

        currentSpeech = null;
        updateVoiceButton(false);

      };

    utterance.onerror =
      function(){

        currentSpeech = null;
        updateVoiceButton(false);

      };

    currentSpeech =
      utterance;

    updateVoiceButton(true);

    window.speechSynthesis.speak(
      utterance
    );

  }

  if(
    window.speechSynthesis
  ){

    window.speechSynthesis.onvoiceschanged =
      function(){

        window.speechSynthesis.getVoices();

      };

  }

  recentScrollUp.addEventListener(
    "click",
    function(){

      recentList.scrollBy(
        {
          top: -160,
          behavior: "smooth"
        }
      );

    }
  );

  recentScrollDown.addEventListener(
    "click",
    function(){

      recentList.scrollBy(
        {
          top: 160,
          behavior: "smooth"
        }
      );

    }
  );



  // =========================
  // PDF UPLOAD
  // =========================

  fileInput.addEventListener(
    "change",
    async function(){

      if(
        fileInput.files.length > 0
      ){

        const file =
          fileInput.files[0];
          fileName.style.display =
  "block";

fileName.innerText =
  file.name;

        const fileReader =
          new FileReader();

        fileReader.onload =
        async function(){

          const typedArray =
            new Uint8Array(
              this.result
            );

          const pdf =
            await pdfjsLib
            .getDocument(
              typedArray
            ).promise;

          let fullText = "";

          // READ PDF PAGES
          for(
            let pageNum = 1;
            pageNum <= pdf.numPages;
            pageNum++
          ){

            const page =
              await pdf.getPage(
                pageNum
              );

            const textContent =
              await page
              .getTextContent();

            const textItems =
              textContent.items
              .map(
                item => item.str
              )
              .join(" ");

            fullText +=
              textItems + "\n\n";

          }

          // SAVE TEXT
          extractedText =
            fullText;

          console.log(
            extractedText
          );

        };

        fileReader.readAsArrayBuffer(
          file
        );

      }

    }

  );



  // =========================
  // EXPLAIN BUTTON
  // =========================
  notesInput.addEventListener(
  "input",
  function(){

    this.style.height =
      "auto";

    this.style.height =
      this.scrollHeight + "px";

  }
);

  explainBtn.addEventListener(
    "click",
    async function(){

      let finalText = "";

      // PDF PRIORITY
      if(
        extractedText !== ""
      ){

        finalText =
          extractedText;

      }

      // NOTES
      else if(
        notesInput.value.trim()
        !== ""
      ){

        finalText =
          notesInput.value;

      }

      // EMPTY
      else{

        alert(
          "Please upload PDF or enter study material."
        );

        return;

      }


      // SHOW LOADING
      loadingText.style.display =
        "flex";

      stopTypingAnimation();
      stopVoiceResponse();

      resultBox.innerText = "";


      // SAVE LOCAL STORAGE
      localStorage.setItem(
        "studyText",
        finalText
      );

      localStorage.setItem(
        "language",
        languageSelect.value
      );


      // GENERATE AI
      generateAIExplanation(
        finalText
      );

    }

  );




// =========================
  // GROQ AI FUNCTION
  // =========================

  async function generateAIExplanation(
    studyText
  ){

    const userLanguage =
      languageSelect.value;


    try{

      let response = await fetch(
        "/api/groq",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content:
                  "You are StudyMind AI, a friendly AI teacher who explains study material clearly for students."
              },
              {
                role: "user",
                content: `You are a friendly AI teacher.

The selected language is:
${userLanguage}

IMPORTANT RULES:

1. Explain ONLY in selected language.

2. Use ONLY English alphabets.

3. Never use Hindi or Nepali scripts.

4. Write naturally like students chat online.

5. For Hindi or Nepali, use simple Roman words that are easy for voice reading.

6. Use short sentences and avoid difficult spellings.

Examples:

Hindi:
"Computer ek electronic machine hai."

Nepali:
"Computer ek electronic machine ho."

English:
"Computer is an electronic machine."

Make explanation:
- beginner friendly
- step-by-step
- real-world examples
- easy to understand
- clean formatting

Add:
1. Explanation
2. Real-world example
3. Important points
4. Short summary

Study Material:

${studyText.substring(0,3000)}`
              }
            ]
          })
        }
      );

      if (
        response.status === 405 ||
        response.status === 404 ||
        response.status === 501
      ) {
        const groqKey =
          window.STUDYMIND_CONFIG && window.STUDYMIND_CONFIG.groqApiKey;

        if (groqKey) {
          console.warn("Proxy /api/groq is unavailable; falling back to local direct Groq request.");
          response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${groqKey}`
              },
              body: JSON.stringify({
                model: window.STUDYMIND_CONFIG.groqModel || "llama-3.3-70b-versatile",
                stream: false,
                messages: [
                  {
                    role: "system",
                    content:
                      "You are StudyMind AI, a friendly AI teacher who explains study material clearly for students."
                  },
                  {
                    role: "user",
                    content: `You are a friendly AI teacher.

The selected language is:
${userLanguage}

IMPORTANT RULES:

1. Explain ONLY in selected language.

2. Use ONLY English alphabets.

3. Never use Hindi or Nepali scripts.

4. Write naturally like students chat online.

5. For Hindi or Nepali, use simple Roman words that are easy for voice reading.

6. Use short sentences and avoid difficult spellings.

Examples:

Hindi:
\"Computer ek electronic machine hai.\"

Nepali:
\"Computer ek electronic machine ho.\"

English:
\"Computer is an electronic machine.\"

Make explanation:
- beginner friendly
- step-by-step
- real-world examples
- easy to understand
- clean formatting

Add:
1. Explanation
2. Real-world example
3. Important points
4. Short summary

Study Material:

${studyText.substring(0,3000)}`
                  }
                ]
              })
            }
          );
        }
      }


      // Try to parse JSON safely — some error responses may be empty
      let data = null;
      try {
        const text = await response.text();

        if (!text || text.trim() === "") {
          // Empty body
          throw new Error("Empty response body from API.");
        }

        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse API response as JSON:", err);

        // If response was not OK, surface HTTP status
        if (!response.ok) {
          throw new Error(`Groq API request failed (status ${response.status}).`);
        }

        // If response was OK but not JSON, show a parse error
        throw new Error("Invalid JSON response from Groq API.");
      }


      // HIDE LOADING
      loadingText.style.display =
        "none";


      // SHOW RESULT
      if(
        data.choices &&
        data.choices.length > 0
      ){

        const aiText =
          data.choices[0]
          .message.content;

        typeAIResponse(
          aiText,
          async function(){

            // SAVE AI TEXT
            localStorage.setItem(
              "aiExplanation",
              aiText
            );

            await saveActivity(
              studyText,
              aiText
            );

          }
        );

      }


      // ERROR
      else if(data.error){

        typeAIResponse(
          "Error: " +
          data.error.message
        );

      }

      else{

        typeAIResponse(
          "AI response not received."
        );

      }

    }

    catch(error){

      console.log(error);

      loadingText.style.display =
        "none";

      typeAIResponse(
        error.message ||
        "Something went wrong while connecting to Groq AI."
      );

    }

  }



  // =========================
  // DOWNLOAD PDF
  // =========================

  voiceBtn.addEventListener(
    "click",
    playVoiceResponse
  );

  downloadBtn.addEventListener(
    "click",
    async function(){

      const aiExplanation =
        localStorage.getItem(
          "aiExplanation"
        ) ||
        resultBox.innerText.trim();

      if(
        !aiExplanation
      ){

        alert(
          "Please generate an AI response first."
        );

        return;

      }

      let fileName =
        prompt(
          "Enter PDF file name:",
          "StudyMind-AI"
        );

      if(
        fileName === null
      ){

        return;

      }

      fileName =
        fileName.trim() ||
        "StudyMind-AI";

      if(
        !fileName
        .toLowerCase()
        .endsWith(".pdf")
      ){

        fileName += ".pdf";

      }

      const { jsPDF } =
        window.jspdf;

      const doc =
        new jsPDF();

      // TITLE
      doc.setFontSize(18);

      doc.text(
        "StudyMind AI Explanation",
        20,
        20
      );


      const splitText =
        doc.splitTextToSize(
          aiExplanation,
          170
        );

      doc.setFontSize(12);

      doc.text(
        splitText,
        20,
        40
      );


      if(
        window.showSaveFilePicker
      ){

        try{

          const fileHandle =
            await window.showSaveFilePicker(
              {
                suggestedName:
                  fileName,
                types:[
                  {
                    description:
                      "PDF Document",
                    accept:{
                      "application/pdf":[
                        ".pdf"
                      ]
                    }
                  }
                ]
              }
            );

          const writable =
            await fileHandle.createWritable();

          await writable.write(
            doc.output(
              "blob"
            )
          );

          await writable.close();

          return;

        }
        catch(error){

          if(
            error.name === "AbortError"
          ){

            return;

          }

          console.warn(
            "Save dialog failed. Using browser download.",
            error
          );

        }

      }

      doc.save(
        fileName
      );

    }

  );



  // =========================
  // THEME TOGGLE
  // =========================

  themeToggle.addEventListener(
    "click",
    function(){

      document.body.classList.toggle(
        "light-mode"
      );

    }

  );



  // =========================
  // NEW TOPIC
  // =========================

  newTopicBtn.addEventListener(
    "click",
    function(){

      // CLEAR INPUT
      notesInput.value = "";

      stopTypingAnimation();
      stopVoiceResponse();

      // CLEAR RESULT
      resultBox.innerText = "";

      // CLEAR PDF TEXT
      extractedText = "";

      // CLEAR STORAGE
      localStorage.removeItem(
        "studyText"
      );

      localStorage.removeItem(
        "aiExplanation"
      );

      closeMobileSidebar();

      // SCROLL TOP
      window.scrollTo(
        0,
        0
      );

    }

  );

}
