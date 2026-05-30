# StudyMind AI

Static frontend with Firebase Auth/Firestore and a server-side Groq API proxy.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Fill in your Firebase values and `GROQ_API_KEY`.
3. Run:

```bash
npm run local
```

4. Open `http://localhost:5500`.

## Public Deployment Notes

Do not commit `.env` or `env-config.js`. They are ignored by Git.

For Vercel deployment from a public GitHub repository, add these Environment Variables in the Vercel dashboard:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`
- `GROQ_API_KEY`
- `GROQ_MODEL`

The frontend calls `/api/groq`, so the Groq key stays on the server.
`env-config.js` is generated at build time from Vercel environment variables.

Recommended Vercel project settings:

- Framework Preset: Other
- Build Command: `npm run build`
- Output Directory: leave empty
- Install Command: leave default
