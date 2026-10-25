import { useState } from "react";
import { Share2, ShieldCheck, Info } from "lucide-react";
import { DEMO_DEFAULT, useDemo, useFavorites } from "@/lib/store";
import { getPractice } from "@/lib/practices";

export function DemoBanner() {
  return (
    <p className="mb-4 flex gap-2 rounded-2xl bg-gold/30 p-4 text-base">
      <Info className="size-5 shrink-0" aria-hidden />
      <span><strong>Simulated connection.</strong> This prototype has no live account linking. Steps below are a demonstration with fictional people on one device.</span>
    </p>
  );
}

export async function shareInvite() {
  const text =
    "I'm using Boundless Bridge for mindfulness. If you'd like to support me, you can open the app and choose \"I'm Here to Support Someone.\" I'll decide what I share with you.";
  const url = typeof window !== "undefined" ? window.location.origin : "";
  if (navigator.share) {
    try { await navigator.share({ title: "Boundless Bridge", text, url }); return "shared"; } catch { return "cancelled"; }
  }
  await navigator.clipboard?.writeText(`${text} ${url}`);
  return "copied";
}

/** Participant side: choose what to share (all OFF by default). */
export function ParticipantShare() {
  const [demo, setDemo] = useDemo();
  const opts = [
    { k: "favorites", label: "My favorite mindfulness practices" },
    { k: "together", label: "Practices I'd like to do together" },
    { k: "message", label: "A message I choose to send" },
  ] as const;
  return (
    <div className="card-soft p-5">
      <h2 className="text-2xl font-semibold text-primary">What Would You Like to Share?</h2>
      <p className="mt-1 text-base text-muted-foreground">Everything starts off. Journal, mood, AI chats, history, and location are never shared.</p>
      <div className="mt-4 grid gap-3">
        {opts.map((o) => (
          <label key={o.k} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 border-border p-3 text-lg">
            <input type="checkbox" className="size-6 accent-[var(--color-sage)]" checked={demo.share[o.k]}
              onChange={(e) => setDemo({ ...demo, share: { ...demo.share, [o.k]: e.target.checked } })} />
            {o.label}
          </label>
        ))}
        {demo.share.message && (
          <textarea value={demo.message} onChange={(e) => setDemo({ ...demo, message: e.target.value })} rows={2} maxLength={300}
            className="rounded-xl border-2 border-input bg-background p-3 text-lg" placeholder="Your message" aria-label="Message to share" />
        )}
      </div>
    </div>
  );
}

/** Step-by-step simulated connection with both sides visible. */
export function ConnectionFlow({ view }: { view: "participant" | "supporter" | "both" }) {
  const [demo, setDemo] = useDemo();
  const [favs] = useFavorites();
  const set = (step: typeof demo.step) => setDemo({ ...demo, step });
  const showP = view !== "supporter";
  const showS = view !== "participant";

  const sharedFavs = (favs.length ? favs : ["grounding", "loving-kindness"]).map((id) => getPractice(id)?.title).filter(Boolean);

  return (
    <div className="grid gap-4">
      {showP && (
        <div className="card-soft p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-sage">Participant · "Jordan" (fictional)</p>
          {demo.step === "idle" && <button onClick={() => set("invited")} className="btn-big mt-3 w-full bg-gold text-gold-foreground">Create demo invitation</button>}
          {demo.step === "invited" && <p className="mt-2 text-lg">Invitation sent to "Sam". Waiting for Sam to accept…</p>}
          {demo.step === "accepted" && (
            <>
              <p className="mt-2 text-lg">Sam accepted. Confirm to connect?</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button onClick={() => set("confirmed")} className="btn-big bg-sage text-sage-foreground">Confirm</button>
                <button onClick={() => setDemo(DEMO_DEFAULT)} className="btn-big border-2 border-border">Decline</button>
              </div>
            </>
          )}
          {demo.step === "confirmed" && (
            <>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="size-5 text-sage" /> You are now connected (demo).</p>
              <button onClick={() => set("revoked")} className="btn-big mt-3 w-full border-2 border-destructive text-destructive">Revoke access</button>
            </>
          )}
          {demo.step === "revoked" && <p className="mt-2 text-lg">Access revoked. Sam can no longer see anything.</p>}
        </div>
      )}
      {showS && (
        <div className="card-soft border-gold p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-gold-foreground">Supporter · "Sam" (fictional)</p>
          {demo.step === "idle" && <p className="mt-2 text-lg text-muted-foreground">No invitation yet. Only the participant can start a connection.</p>}
          {demo.step === "invited" && <button onClick={() => set("accepted")} className="btn-big mt-3 w-full bg-primary text-primary-foreground">Accept Jordan's invitation</button>}
          {demo.step === "accepted" && <p className="mt-2 text-lg">Waiting for Jordan to confirm…</p>}
          {demo.step === "revoked" && <p className="mt-2 text-lg text-muted-foreground">Jordan has ended sharing. Nothing is visible.</p>}
          {demo.step === "confirmed" && (
            <div className="mt-2 grid gap-2 text-lg">
              <p className="font-semibold text-primary">What Jordan chose to share:</p>
              {!demo.share.favorites && !demo.share.together && !demo.share.message && <p className="text-muted-foreground">Nothing shared yet.</p>}
              {demo.share.favorites && <p>Favorite practices: {sharedFavs.join(", ")}</p>}
              {demo.share.together && <p>Would like to do together: Two-Minute Grounding, Mindful Walking</p>}
              {demo.share.message && <p>Message: "{demo.message || "Thank you for being here."}"</p>}
              <p className="text-sm text-muted-foreground">Reflections, mood, and AI conversations are never visible here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function InviteShareButton() {
  const [status, setStatus] = useState("");
  return (
    <div>
      <button onClick={async () => setStatus(await shareInvite())} className="btn-big w-full bg-primary text-primary-foreground">
        <Share2 className="size-6" /> Share an invitation message
      </button>
      {status === "copied" && <p className="mt-2 text-base text-muted-foreground" role="status">Message copied. Paste it in a text or email.</p>}
    </div>
  );
}
