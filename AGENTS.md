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

- AI Buddy replies come from the scripted `mockReply` in `src/lib/buddy.ts` until a real AI service is connected; swap only the reply source and keep the UI labeled "Practice mode" while scripted — scripted replies must never be shown as live AI.
- AI Buddy conversations, memories, and settings are device-only (`bb.buddy.*` localStorage keys) and never flow into the supporter connection — participant privacy.
