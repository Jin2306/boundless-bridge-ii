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

- Participant/supporter data (role, favorites, reflections, settings, demo connection) lives in browser localStorage via `src/lib/store.ts`; no backend accounts, so the connection flow is a clearly labeled simulation.
- Practice content and the feeling→practice mapping live in `src/lib/practices.ts` and work without AI; the AI Practice Guide (`src/lib/guide.functions.ts`) is optional and must fail gracefully.
