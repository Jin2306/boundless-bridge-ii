<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- AI Buddy replies come from the live Lovable AI gateway (`askBuddy` in `src/lib/buddy.functions.ts`, which loads the server-only `src/lib/buddy.server.ts` inside the handler; model `openai/gpt-6-astra`, raw `/v1/responses` like `guide.functions.ts`) with the scripted `mockReply` as fallback; when a reply falls back to scripted, the UI must show Practice mode — scripted replies must never be shown as live AI.
- AI Buddy conversations, memories, and settings are device-only (`bb.buddy.*` localStorage keys) and never flow into the supporter connection — participant privacy.
- Offline AI Buddy runs Gemma on-device via @mlc-ai/web-llm (`src/lib/gemma.ts`, dynamically imported only in browser handlers); order is live gateway → on-device Gemma (when downloaded and offline/failing) → scripted Practice mode, and each mode shows its own banner. Crisis detection on-device stays rule-based for reliability.
- Phone line: `src/routes/api/public/voice.ts` answers Twilio voice webhooks with TwiML (Gather speech → askBuddyReply → Say); stateless, no memory or history, requires a valid X-Twilio-Signature via TWILIO_AUTH_TOKEN, and crisis replies stay rule-based and end the call with 988.
