# Boundless Bridge

**Your practice. Your people. Your next chapter.**

A mobile-first companion website for people navigating major life transitions — grounded in the Boundless Freedom Project's mindfulness curriculum. No app store, no data plan requirement, no accounts.

## What it is

Boundless Bridge has two sides:

- **Participant side** — a practice library (grounding, breathing, mindful moments), a journaling/journey space, and **AI Buddy**: a supportive companion you can chat with by text or voice.
- **Supporter side** — resources for the person walking alongside a participant: practice guides, "Ask the Practice Guide" (live AI), and shared practice sessions.

Everything is designed to work on the hardware people actually have: a phone browser, a shared library computer, or a plain phone call.

## How AI Buddy replies work (three tiers, always transparent)

The chat always shows which mode it is in — a real model is never passed off as scripted, or the reverse.

1. **Live AI** — replies come from a large model via the Lovable AI Gateway (`askBuddy` server function). Crisis phrasing is still caught by a fixed phrase list, so safety never depends on the model.
2. **On-device AI (Gemma)** — if there is no internet (or the live call fails) and offline AI is enabled, a Gemma 2 2B model runs entirely in the browser via WebGPU (`@mlc-ai/web-llm`, ~1.4 GB one-time download from Settings → AI Buddy → Download offline AI). Memories and conversation never leave the device.
3. **Practice mode** — a scripted, rule-based fallback responder (practice suggestions, talk offers, crisis → 988). Shown with a "Practice mode" banner.

Crisis responses (self-harm risk) are always deterministic — fixed 988/911 guidance, never model-generated.

## Privacy model

- **Participant conversations, memories, and settings are device-only.** They live in the browser's local storage under `bb.buddy.*` keys and never reach a server or the supporter side.
- Memory notes are only included in AI prompts when the participant turns memory **on** (off by default).
- The supporter connection is consent-gated on both sides and is currently a local simulation (see below).
- The phone line is stateless: no transcripts, no history, nothing saved.

## Real vs. simulated

| Feature | Status |
| --- | --- |
| Practice library, journeys, moments | ✅ Real (device-only data) |
| AI Buddy chat (live / on-device / practice) | ✅ Real |
| Web Speech voice input & read-aloud | ✅ Real (browser-dependent) |
| Offline on-device Gemma | ✅ Real (WebGPU-capable browsers) |
| "Ask the Practice Guide" (supporter) | ✅ Real (live AI) |
| Participant ↔ supporter connection | 🔶 Simulated locally (invite + consent demo) |
| Phone line | 🔶 Handler is real (`/api/public/voice`, Twilio TwiML with signature validation); Twilio number not connected yet |
| Simulated call demo | ✅ Real demo at `/phone-demo` (simulates the call in-browser) |

## Running locally

```sh
npm i
npm run dev
```

Then open the printed URL. Mobile viewport recommended — the site is designed phone-first.

## Tests

```sh
npm test
```

Vitest covers the AI Buddy reply parsing, the three-tier fallback order, memory-candidate extraction, and crisis-detection behavior.

## Phone line (Twilio)

The voice webhook lives at `src/routes/api/public/voice.ts`. It answers Twilio voice calls with TwiML (speech gather → AI reply → say), validates the `X-Twilio-Signature` header against `TWILIO_AUTH_TOKEN` (a server-side secret), and ends the call with 988 guidance on crisis replies. Unsigned calls are rejected.

To go live: connect a Twilio project, set the Auth Token as a project secret, point the voice webhook at the published site's `/api/public/voice`, and publish. Until then, `/phone-demo` simulates a full call in the browser.

## Built with

- TanStack Start v1 (SSR + server functions), TanStack Router, React 19, TypeScript, Vite 7
- Tailwind CSS v4, Lucide icons, mobile-first design
- Lovable AI Gateway (`openai/gpt-6-astra`) for live AI
- `@mlc-ai/web-llm` (Gemma 2 2B) for offline on-device AI
- Web Speech API (`SpeechRecognition` + `speechSynthesis`)
- Vitest, Playwright
