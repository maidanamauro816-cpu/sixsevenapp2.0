# SixSeven AI Voice Test

This is an isolated voice-activation prototype served at `/voice-test.html`. It is added on the test branch `test/sixseven-ai-voice`; it does not modify the main branch.

## What it tests
- Black interface with a pulsing red neon orb (no robot face).
- Foreground speech recognition in Spanish (browser Web Speech API).
- Detects phrases such as “Hey SixSeven” and passes the following words to a configurable server endpoint.
- Does not store or expose a Gemini API key in the browser.

## Important limitation
The repository currently has no confirmed, deployed SixSeven AI HTTP endpoint in the app code. The prototype can test the wake phrase immediately, but a real AI reply requires the server endpoint to be deployed and entered in the endpoint field. It must accept POST JSON `{"message":"..."}` and return JSON with a string field `reply`, `response`, or `text`. Adapt this adapter to the actual Firebase callable/function contract before considering the AI integration complete.

Speech recognition requires microphone permission and a compatible browser. This is foreground-only; Android may suspend microphone recognition in the background. This prototype is not a finished APK and does not promise always-on listening.
