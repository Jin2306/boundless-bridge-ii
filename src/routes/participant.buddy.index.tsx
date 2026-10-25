import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Send, Volume2, Pause, Play, History, Brain, Plus, Trash2, Flower2, Users, Copy, X } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { getPractice } from "@/lib/practices";
import { askBuddy } from "@/lib/buddy.functions";
import {
  MAX_LEN, QUICK_STARTS, WELCOME, mockReply, uid, useBuddySettings, useConversations, useMemories,
  type BuddyMsg, type Conversation,
} from "@/lib/buddy";

export const Route = createFileRoute("/participant/buddy/")({
  head: () => ({
    meta: [
      { title: "AI Buddy — Boundless Bridge" },
      { name: "description", content: "A listening ear, whenever you need a moment." },
      { property: "og:title", content: "AI Buddy — Boundless Bridge" },
      { property: "og:description", content: "A listening ear, whenever you need a moment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuddyPage,
});

const welcomeMsg = (): BuddyMsg => ({ id: "welcome", role: "buddy", text: WELCOME });

type SR = { start: () => void; stop: () => void; abort: () => void; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null; interimResults: boolean; lang: string; continuous: boolean };

function BuddyPage() {
  const [settings, setSettings] = useBuddySettings();
  const [convos, setConvos] = useConversations();
  const [memories, setMemories] = useMemories();
  const [convId, setConvId] = useState(() => uid());
  const [messages, setMessages] = useState<BuddyMsg[]>([welcomeMsg()]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<"live" | "device" | "practice">("live");
  const [showHistory, setShowHistory] = useState(false);
  const [handled, setHandled] = useState<Record<string, boolean>>({});
  const [recording, setRecording] = useState(false);
  const [askVoice, setAskVoice] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const recRef = useRef<SR | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, thinking]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); recRef.current?.abort(); }, []);

  const persist = (msgs: BuddyMsg[]) => {
    if (!settings.history || msgs.length < 2) return;
    const first = msgs.find((m) => m.role === "user")?.text ?? "Conversation";
    const c: Conversation = { id: convId, title: first.slice(0, 60), updatedAt: new Date().toISOString(), messages: msgs };
    setConvos((prev) => [c, ...prev.filter((p) => p.id !== convId)].slice(0, 30));
  };

  const play = (m: BuddyMsg) => {
    if (!("speechSynthesis" in window)) { toast.error("Audio isn't available in this browser."); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(m.text);
    u.rate = 0.9;
    u.onend = () => { setSpeakingId(null); setPaused(false); };
    setSpeakingId(m.id); setPaused(false);
    window.speechSynthesis.speak(u);
  };
  const stopAudio = () => { window.speechSynthesis?.cancel(); setSpeakingId(null); setPaused(false); };
  const togglePause = () => {
    if (paused) window.speechSynthesis.resume(); else window.speechSynthesis.pause();
    setPaused(!paused);
  };

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_LEN);
    if (!text || thinking) return;
    const userMsg: BuddyMsg = { id: uid(), role: "user", text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setThinking(true);
    let reply: Omit<BuddyMsg, "id" | "role"> | null = null;
    let nextMode: "live" | "device" | "practice" = "live";
    const history = next.slice(0, -1).filter((m) => m.id !== "welcome").slice(-8).map((m) => ({ role: m.role, text: m.text }));
    const mems = settings.memory ? memories.slice(0, 10).map((m) => m.text) : [];
    const turn = next.filter((m) => m.role === "user").length;
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    if (!offline) {
      try {
        const res = await askBuddy({ data: { message: text, history, memories: mems, memoryOn: settings.memory } });
        if (res.ok) reply = res.reply;
        else if (!settings.offlineAi) toast.error(res.error);
      } catch {
        /* network failure: try on-device below */
      }
    }
    if (!reply && settings.offlineAi) {
      try {
        const { gemmaReply, gemmaSupported } = await import("@/lib/gemma");
        if (gemmaSupported()) {
          reply = await gemmaReply(text, { history, memories: mems, memoryOn: settings.memory, turn });
          nextMode = "device";
        }
      } catch {
        /* fall through to scripted */
      }
    }
    if (!reply) {
      nextMode = "practice";
      reply = mockReply(text, { memoryOn: settings.memory, turn });
    }
    const all: BuddyMsg[] = [...next, { id: uid(), role: "buddy", ...reply }];
    setMessages(all);
    setMode(nextMode);
    setThinking(false);
    persist(all);
    if (settings.voiceReplies) play(all[all.length - 1]!);
    inputRef.current?.focus();
  };

  const startRecording = () => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) { toast.error("Voice input isn't supported in this browser. Try Chrome, or type instead."); return; }
    if (!settings.voiceConsent) { setAskVoice(true); return; }
    const rec: SR = new Ctor();
    rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false;
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
      setInput(t.slice(0, MAX_LEN));
    };
    rec.onerror = (e: any) => {
      setRecording(false);
      toast.error(e?.error === "not-allowed" ? "Microphone permission was denied. You can type instead." : "Couldn't hear that. Please try again or type.");
    };
    rec.onend = () => { setRecording(false); inputRef.current?.focus(); };
    recRef.current = rec;
    try { rec.start(); setRecording(true); } catch { setRecording(false); }
  };
  const stopRecording = () => recRef.current?.stop();

  const newConversation = () => { stopAudio(); setConvId(uid()); setMessages([welcomeMsg()]); setHandled({}); setMode("live"); setShowHistory(false); };
  const openConversation = (c: Conversation) => { stopAudio(); setConvId(c.id); setMessages(c.messages); setHandled({}); setMode("live"); setShowHistory(false); };

  const remember = (m: BuddyMsg, yes: boolean) => {
    setHandled((h) => ({ ...h, [m.id]: true }));
    if (yes && m.memoryCandidate) {
      setMemories((prev) => [{ id: uid(), text: m.memoryCandidate!, date: new Date().toISOString() }, ...prev]);
      toast.success("Saved to What AI Buddy Remembers.");
    }
  };

  const copy = async (t: string) => {
    if (!confirm("Copy this message so you can share it yourself?")) return;
    try { await navigator.clipboard.writeText(t); toast.success("Copied."); } catch { toast.error("Couldn't copy."); }
  };

  if (!settings.enabled) {
    return (
      <Shell mode="participant" back="/participant">
        <div className="card-soft p-6 text-lg">
          <p>AI Buddy is turned off.</p>
          <button onClick={() => setSettings({ ...settings, enabled: true })} className="btn-big mt-4 w-full bg-primary text-primary-foreground">Turn on AI Buddy</button>
        </div>
      </Shell>
    );
  }

  const onlyWelcome = messages.length === 1;

  return (
    <Shell mode="participant" back="/participant">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-primary">AI Buddy</h1>
          <p className="text-lg text-muted-foreground">Here to listen.</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowHistory((s) => !s)} aria-label="Past conversations" className="flex size-12 items-center justify-center rounded-full text-primary hover:bg-muted"><History className="size-6" /></button>
          <Link to="/participant/buddy/memory" aria-label="What AI Buddy remembers" className="flex size-12 items-center justify-center rounded-full text-primary hover:bg-muted"><Brain className="size-6" /></Link>
          <button onClick={newConversation} aria-label="New conversation" className="flex size-12 items-center justify-center rounded-full text-primary hover:bg-muted"><Plus className="size-6" /></button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">I'm an AI companion, not a person or therapist.</p>
      {mode === "live" ? (
        <p className="mt-2 rounded-xl bg-sage/30 px-3 py-2 text-sm font-semibold text-foreground" role="note">
          Live AI: your messages are sent to write replies. They stay on this device{settings.memory ? ", and saved memory notes help write them" : ""} — never shared with supporters.
        </p>
      ) : mode === "device" ? (
        <p className="mt-2 rounded-xl bg-sage/30 px-3 py-2 text-sm font-semibold text-foreground" role="note">
          On-device AI (Gemma): no internet needed. Your messages and memories never leave this phone.
        </p>
      ) : (
        <p className="mt-2 rounded-xl bg-gold/30 px-3 py-2 text-sm font-semibold text-foreground" role="note">
          Practice mode: replies are scripted examples, not live AI. Everything stays on this device.
        </p>
      )}

      {showHistory && (
        <section className="mt-4 card-soft p-4">
          <h2 className="text-lg font-semibold text-primary">Past conversations</h2>
          {!settings.history && <p className="mt-1 text-base text-muted-foreground">Saving history is off. Turn it on in Settings.</p>}
          {convos.length === 0 ? <p className="mt-2 text-base text-muted-foreground">No saved conversations yet.</p> : (
            <ul className="mt-2 grid gap-2">
              {convos.map((c) => (
                <li key={c.id} className="flex items-center gap-2 rounded-xl border-2 border-border">
                  <button onClick={() => openConversation(c)} className="min-h-12 flex-1 px-3 text-left text-base">
                    <span className="block font-semibold">{c.title}</span>
                    <span className="text-sm text-muted-foreground">{new Date(c.updatedAt).toLocaleString()}</span>
                  </button>
                  <button aria-label="Delete conversation" onClick={() => setConvos((p) => p.filter((x) => x.id !== c.id))} className="flex size-12 items-center justify-center text-destructive"><Trash2 className="size-5" /></button>
                </li>
              ))}
            </ul>
          )}
          {convos.length > 0 && (
            <button onClick={() => { if (confirm("Delete all saved conversations?")) setConvos([]); }} className="mt-3 min-h-12 font-semibold text-destructive">Delete all conversations</button>
          )}
          <p className="mt-2 text-sm text-muted-foreground">Anyone using this device or browser could see saved conversations.</p>
        </section>
      )}

      <div className="mt-4 grid gap-3" aria-live="polite">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "ml-10 justify-self-end" : "mr-6"}>
            <div className={`rounded-3xl px-5 py-4 text-lg leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : m.crisis ? "border-2 border-destructive/50 bg-card" : "bg-card shadow-soft"}`}>
              {m.text}
            </div>
            {m.role === "buddy" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {speakingId === m.id ? (
                  <>
                    <button onClick={togglePause} className="flex min-h-11 items-center gap-1 rounded-full border-2 border-border px-3 text-sm font-semibold text-primary">{paused ? <Play className="size-4" /> : <Pause className="size-4" />}{paused ? "Resume" : "Pause"}</button>
                    <button onClick={stopAudio} className="flex min-h-11 items-center gap-1 rounded-full border-2 border-border px-3 text-sm font-semibold text-primary"><Square className="size-4" />Stop</button>
                  </>
                ) : (
                  <button onClick={() => play(m)} className="flex min-h-11 items-center gap-1 rounded-full border-2 border-border px-3 text-sm font-semibold text-primary"><Volume2 className="size-4" />Listen</button>
                )}
                <button onClick={() => copy(m.text)} aria-label="Copy this message" className="flex min-h-11 items-center gap-1 rounded-full border-2 border-border px-3 text-sm font-semibold text-primary"><Copy className="size-4" />Copy</button>
                {m.practiceId && getPractice(m.practiceId) && (
                  <Link to="/participant/practice/$id" params={{ id: m.practiceId }} className="flex min-h-11 items-center gap-1 rounded-full bg-sage px-4 text-sm font-semibold text-sage-foreground"><Flower2 className="size-4" />Start {getPractice(m.practiceId)!.title}</Link>
                )}
                {m.offerTalk && (
                  <Link to="/participant/connect" className="flex min-h-11 items-center gap-1 rounded-full bg-gold px-4 text-sm font-semibold text-gold-foreground"><Users className="size-4" />Talk to Someone</Link>
                )}
                {m.crisis && (
                  <>
                    <a href="tel:988" className="flex min-h-11 items-center rounded-full bg-destructive px-4 text-sm font-bold text-destructive-foreground">Call 988</a>
                    <a href="sms:988" className="flex min-h-11 items-center rounded-full border-2 border-destructive px-4 text-sm font-bold text-destructive">Text 988</a>
                  </>
                )}
              </div>
            )}
            {m.memoryCandidate && !handled[m.id] && (
              <div className="mt-2 rounded-2xl border-2 border-primary/40 bg-card p-4">
                <p className="text-base">Remember: <strong>{m.memoryCandidate}</strong>?</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => remember(m, true)} className="btn-big flex-1 bg-primary text-primary-foreground">Remember This</button>
                  <button onClick={() => remember(m, false)} className="btn-big flex-1 border-2 border-border text-primary">Not Now</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {onlyWelcome && (
          <div className="flex flex-wrap gap-2">
            {QUICK_STARTS.map((q) => (
              <button key={q} onClick={() => send(q)} className="min-h-12 rounded-full border-2 border-primary px-4 text-base font-semibold text-primary">{q}</button>
            ))}
          </div>
        )}
        {thinking && <div className="mr-6 w-fit rounded-3xl bg-card px-5 py-4 text-lg text-muted-foreground shadow-soft">AI Buddy is thinking…</div>}
        <div ref={endRef} />
      </div>

      {askVoice && (
        <div className="mt-4 rounded-2xl border-2 border-primary/40 bg-card p-4 text-base">
          <p>Voice input uses your browser's speech service, which may send audio to your browser maker (for example Google in Chrome) to turn it into text. Nothing is recorded until you tap the microphone, and audio isn't saved by this site.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setSettings({ ...settings, voiceConsent: true }); setAskVoice(false); }} className="btn-big flex-1 bg-primary text-primary-foreground">I agree</button>
            <button onClick={() => setAskVoice(false)} className="btn-big flex-1 border-2 border-border text-primary">No thanks</button>
          </div>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="sticky bottom-20 mt-4 rounded-3xl border-2 border-border bg-card p-3 shadow-lift">
        {recording && <p className="mb-2 flex items-center gap-2 text-base font-semibold text-destructive" role="status"><span className="size-3 animate-pulse rounded-full bg-destructive" /> Listening… tap stop when done</p>}
        <label htmlFor="buddy-input" className="sr-only">Message AI Buddy</label>
        <textarea id="buddy-input" ref={inputRef} autoFocus rows={2} maxLength={MAX_LEN} value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Type what's on your mind…" className="w-full resize-none bg-transparent px-2 text-lg outline-none" />
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={recording ? stopRecording : startRecording} aria-label={recording ? "Stop recording" : "Speak instead"}
            className={`flex size-14 items-center justify-center rounded-full ${recording ? "bg-destructive text-destructive-foreground" : "border-2 border-border text-primary"}`}>
            {recording ? <Square className="size-6" /> : <Mic className="size-6" />}
          </button>
          {input && !recording && (
            <button type="button" onClick={() => setInput("")} aria-label="Clear message" className="flex size-14 items-center justify-center rounded-full text-muted-foreground"><X className="size-6" /></button>
          )}
          <label className="ml-auto flex min-h-12 items-center gap-2 text-sm font-semibold text-primary">
            <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={settings.voiceReplies} onChange={(e) => setSettings({ ...settings, voiceReplies: e.target.checked })} />
            Voice Mode
          </label>
          <button type="submit" disabled={!input.trim() || thinking} aria-label="Send" className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"><Send className="size-6" /></button>
        </div>
      </form>
    </Shell>
  );
}
