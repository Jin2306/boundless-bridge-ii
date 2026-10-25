import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { ConnectionFlow, DemoBanner } from "@/components/ConnectionDemo";

export const Route = createFileRoute("/supporter/connect")({
  head: () => ({
    meta: [
      { title: "Connect With My Participant — Boundless Bridge" },
      { name: "description", content: "A consent-based connection where the participant decides what to share." },
      { property: "og:title", content: "Connect With My Participant" },
      { property: "og:description", content: "The participant stays in control." },
    ],
  }),
  component: SupporterConnect,
});

const STARTERS = [
  "Thinking of you today.",
  "Would you like to take a walk together?",
  "I'm here if you want to talk.",
  "Would it help to practice mindfulness together?",
];

function SupporterConnect() {
  const [msg, setMsg] = useState("");
  const send = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: msg }); } catch { /* cancelled */ }
    } else {
      window.location.href = `mailto:?body=${encodeURIComponent(msg)}`;
    }
  };
  return (
    <Shell mode="supporter">
      <PageTitle title="Connect With My Participant" subtitle="They lead. You support." />
      <div className="card-soft p-5">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-primary"><ShieldCheck className="size-6 text-sage" /> How connection works</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">
          <li>Only the participant can start a connection.</li>
          <li>You only see what they choose to share.</li>
          <li>They can stop sharing anytime.</li>
          <li>No location, mood, journal, or AI chats — ever.</li>
          <li>No activity tracking or alerts.</li>
        </ul>
      </div>

      <section className="mt-4 card-soft p-5">
        <h2 className="text-xl font-semibold text-primary">Send a supportive message</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button key={s} onClick={() => setMsg(s)} className="min-h-12 rounded-full bg-secondary px-4 text-base font-semibold text-secondary-foreground">{s}</button>
          ))}
        </div>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} maxLength={500} aria-label="Your message"
          className="mt-3 w-full rounded-xl border-2 border-input bg-background p-3 text-lg" placeholder="Write or pick a message, then review it." />
        <button onClick={send} disabled={!msg.trim()} className="btn-big mt-3 w-full bg-primary text-primary-foreground disabled:opacity-50">
          <Send className="size-5" /> Review & send with my phone
        </button>
        <p className="mt-2 text-base text-muted-foreground">Opens your phone's sharing or email. Boundless Bridge does not deliver messages itself.</p>
      </section>

      <div className="mt-6"><DemoBanner /></div>
      <ConnectionFlow view="supporter" />
    </Shell>
  );
}
