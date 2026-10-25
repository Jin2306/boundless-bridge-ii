import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ShieldAlert } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { askGuide } from "@/lib/guide.functions";
import { getPractice } from "@/lib/practices";
import { useRole, useSettings } from "@/lib/store";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Practice Guide — Boundless Bridge" },
      { name: "description", content: "Optional AI suggestions for a mindfulness practice or supportive next step." },
      { property: "og:title", content: "Practice Guide" },
      { property: "og:description", content: "Optional AI suggestions for mindfulness and support." },
    ],
  }),
  component: Guide,
});

function Guide() {
  const [role] = useRole();
  const r = role ?? "participant";
  const [settings, setSettings] = useSettings();
  const ask = useServerFn(askGuide);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<{ text: string; practice: string } | null>(null);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setReply(null);
    try {
      const res = await ask({ data: { role: r, message: input.trim() } });
      if (res.ok) setReply({ text: res.text, practice: res.practice });
      else setError(res.error);
    } catch {
      setError("The guide isn't available right now. Your practices still work.");
    } finally {
      setLoading(false);
    }
  };

  const practiceLink = (id: string) =>
    r === "participant"
      ? { to: "/participant/practice/$id" as const, params: { id } }
      : { to: "/supporter/together" as const, params: {} };

  return (
    <Shell mode={r} back={r === "participant" ? "/participant" : "/supporter"}>
      <PageTitle title="Practice Guide" subtitle={r === "participant" ? "Tell me what's going on. I'll suggest a practice." : "Ask how you might support someone."} />

      {!settings.aiConsent ? (
        <div className="card-soft p-5">
          <ShieldAlert className="size-8 text-gold" aria-hidden />
          <h2 className="mt-2 text-xl font-semibold text-primary">Before you start</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">
            <li>Your message is sent to an outside AI service to create a reply.</li>
            <li>It is not saved on this site or shared with anyone you know.</li>
            <li>Don't include names, addresses, or personal history.</li>
            <li>The guide is not a therapist, lawyer, or BFP staff.</li>
          </ul>
          <button onClick={() => setSettings({ ...settings, aiConsent: true })} className="btn-big mt-4 w-full bg-primary text-primary-foreground">I understand, continue</button>
          <Link to={r === "participant" ? "/participant/practices" : "/supporter/learn"} className="btn-big mt-2 w-full border-2 border-border text-primary">No thanks</Link>
        </div>
      ) : (
        <>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} maxLength={800} aria-label="Your message"
            placeholder={r === "participant" ? "I'm nervous about tomorrow." : "My brother is stressed about finding a job. How can I support him?"}
            className="w-full rounded-xl border-2 border-input bg-card p-4 text-lg" />
          <button onClick={submit} disabled={loading || !input.trim()} className="btn-big mt-3 w-full bg-primary text-primary-foreground disabled:opacity-50">
            <Sparkles className="size-5" /> {loading ? "Thinking…" : "Ask"}
          </button>

          {error && (
            <div className="mt-4 card-soft p-5" role="status">
              <p className="text-lg">{error}</p>
              <Link {...practiceLink("grounding")} className="btn-big mt-3 w-full bg-sage text-sage-foreground">Start a grounding practice</Link>
            </div>
          )}

          {reply && (
            <div className="mt-4 card-soft p-5" aria-live="polite">
              <p className="whitespace-pre-line text-lg">{reply.text}</p>
              <div className="mt-4 grid gap-2">
                {r === "participant" ? (
                  <>
                    <Link {...practiceLink(reply.practice)} className="btn-big bg-sage text-sage-foreground">Start {getPractice(reply.practice)?.title}</Link>
                    <Link to="/participant/connect" className="btn-big bg-gold text-gold-foreground">Talk to Someone</Link>
                  </>
                ) : (
                  <>
                    <Link to="/supporter/together" className="btn-big bg-sage text-sage-foreground">Practice Together</Link>
                    <Link to="/supporter/learn" className="btn-big border-2 border-primary text-primary">Learn More</Link>
                    <Link to="/supporter/resources" className="btn-big bg-gold text-gold-foreground">Contact BFP</Link>
                  </>
                )}
              </div>
            </div>
          )}
          <p className="mt-4 text-base text-muted-foreground">AI can make mistakes. In danger, call 911. For crisis support, call or text 988.</p>
        </>
      )}
    </Shell>
  );
}
