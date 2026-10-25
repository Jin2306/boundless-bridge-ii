import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Mic, Send } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { askBuddy } from "@/lib/buddy.functions";
import { mockReply } from "@/lib/buddy";

export const Route = createFileRoute("/phone-demo")({
  head: () => ({
    meta: [
      { title: "Phone Line Demo — Boundless Bridge" },
      { name: "description", content: "A simulated call to the AI Buddy phone line, for people without a smartphone." },
      { property: "og:title", content: "AI Buddy Phone Line Demo" },
      { property: "og:description", content: "Try what calling AI Buddy from any phone feels like." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PhoneDemo,
});

const GREETING =
  "Hi, this is AI Buddy from Boundless Bridge. I'm an AI companion, not a person or a therapist. If you are in crisis, hang up and call or text 9 8 8. What's on your mind?";

type Line = { who: "caller" | "buddy"; text: string };

function PhoneDemo() {
  const [inCall, setInCall] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [seconds, setSeconds] = useState(0);
  const inCallRef = useRef(false);

  useEffect(() => {
    if (!inCall) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [inCall]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (text: string, then?: () => void) => {
    setLines((p) => [...p, { who: "buddy", text }]);
    if (!("speechSynthesis" in window)) { then?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/9 8 8/g, "nine eight eight"));
    u.rate = 0.95;
    u.onend = () => then?.();
    window.speechSynthesis.speak(u);
  };

  const hangUp = (msg?: string) => {
    inCallRef.current = false;
    setInCall(false);
    setListening(false);
    if (msg) setLines((p) => [...p, { who: "buddy", text: msg }]);
  };

  const call = () => {
    setLines([]); setSeconds(0); setLive(null);
    inCallRef.current = true;
    setInCall(true);
    speak(GREETING);
  };

  const handle = async (raw: string) => {
    const speech = raw.trim().slice(0, 1000);
    if (!speech || busy || !inCallRef.current) return;
    setInput("");
    setLines((p) => [...p, { who: "caller", text: speech }]);
    if (/\b(goodbye|bye|hang up|that's all)\b/i.test(speech)) {
      speak("Thanks for calling. Take care of yourself.", () => hangUp());
      inCallRef.current = false; setInCall(false);
      return;
    }
    const scripted = mockReply(speech, { memoryOn: false, turn: lines.length });
    if (scripted.crisis) {
      speak(`${scripted.text} I'll end this call now so you can reach them. Please call or text 9 8 8.`, () => hangUp());
      inCallRef.current = false; setInCall(false);
      return;
    }
    setBusy(true);
    let text = scripted.text;
    let isLive = false;
    try {
      const res = await askBuddy({ data: { message: speech, history: [], memories: [], memoryOn: false } });
      if (res.ok) { text = res.reply.text; isLive = true; }
    } catch { /* scripted */ }
    setBusy(false);
    setLive(isLive);
    if (inCallRef.current) speak(text);
  };

  const mic = () => {
    type SR = { lang: string; interimResults: boolean; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; onerror: () => void; start: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) { setLines((p) => [...p, { who: "buddy", text: "(Speaking isn't supported in this browser — type below instead.)" }]); return; }
    window.speechSynthesis?.cancel();
    const rec = new Ctor();
    rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0]?.[0].transcript ?? ""; void handle(t); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <Shell back="/demo">
      <PageTitle title="Phone Line Demo" subtitle="What calling AI Buddy from any phone feels like." />
      <p className="rounded-xl bg-gold/30 px-3 py-2 text-sm font-semibold text-foreground" role="note">
        Simulated call: no real phone number is connected yet. Audio plays in this browser. Nothing is saved.
      </p>

      <section className="card-soft mt-4 p-5 text-center">
        <p className="text-sm text-muted-foreground">Calling</p>
        <p className="text-2xl font-semibold text-primary">AI Buddy Line</p>
        <p className="mt-1 text-lg" aria-live="polite">{inCall ? (busy ? "AI Buddy is thinking…" : listening ? "Listening…" : `On call · ${mmss}`) : lines.length ? "Call ended" : "Ready"}</p>
        {live !== null && inCall && (
          <p className="mt-1 text-sm text-muted-foreground">{live ? "Replies: live AI" : "Replies: practice mode (scripted)"}</p>
        )}
        <div className="mt-4 flex justify-center gap-4">
          {!inCall ? (
            <button onClick={call} aria-label="Call AI Buddy" className="flex size-20 items-center justify-center rounded-full bg-sage text-sage-foreground"><Phone className="size-9" /></button>
          ) : (
            <>
              <button onClick={mic} disabled={busy || listening} aria-label="Speak" className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"><Mic className="size-9" /></button>
              <button onClick={() => { window.speechSynthesis?.cancel(); hangUp(); }} aria-label="Hang up" className="flex size-20 items-center justify-center rounded-full bg-destructive text-destructive-foreground"><PhoneOff className="size-9" /></button>
            </>
          )}
        </div>
      </section>

      {inCall && (
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); void handle(input); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type what the caller says" aria-label="What the caller says"
            className="min-h-14 flex-1 rounded-xl border-2 border-border bg-card px-4 text-lg" />
          <button type="submit" aria-label="Say it" disabled={busy || !input.trim()} className="btn-big bg-primary px-4 text-primary-foreground disabled:opacity-50"><Send className="size-5" /></button>
        </form>
      )}

      {lines.length > 0 && (
        <ul className="mt-4 grid gap-2" aria-label="Call transcript">
          {lines.map((l, i) => (
            <li key={i} className={`rounded-xl px-4 py-3 text-lg ${l.who === "caller" ? "bg-muted" : "card-soft"}`}>
              <span className="block text-sm font-semibold text-muted-foreground">{l.who === "caller" ? "Caller" : "AI Buddy"}</span>
              {l.text}
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
