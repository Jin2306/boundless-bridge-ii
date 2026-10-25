import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { ConnectionFlow, DemoBanner, ParticipantShare } from "@/components/ConnectionDemo";
import { DEMO_DEFAULT, useDemo, useRole } from "@/lib/store";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo Mode — Boundless Bridge" },
      { name: "description", content: "Four guided scenarios: participant, supporter, consent-based connection, and AI Buddy." },
      { property: "og:title", content: "Boundless Bridge Demo" },
      { property: "og:description", content: "See both experiences and how the participant stays in control." },
    ],
  }),
  component: Demo,
});

const TABS = ["1 · Participant", "2 · Family", "3 · Connecting", "4 · AI Buddy"] as const;

function Demo() {
  const [tab, setTab] = useState(0);
  const [, setDemo] = useDemo();
  const [, setRole] = useRole();
  return (
    <Shell back="/">
      <PageTitle title="Demo Mode" subtitle="Fictional people only. Walk through four scenarios." />
      <div role="tablist" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TABS.map((t, i) => (
          <button key={t} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
            className={`min-h-14 rounded-2xl px-2 text-base font-bold ${tab === i ? "bg-primary text-primary-foreground" : "bg-card text-primary border-2 border-border"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === 0 && (
          <Scenario title="Participant under stress" story="Jordan just finished a hard job interview and opens Boundless Bridge.">
            <Step n={1}>Choose "I'm Here for Myself"</Step>
            <Step n={2}>Tap "I Need a Moment"</Step>
            <Step n={3}>Tap "I'm feeling worried" → a short breathing practice starts</Step>
            <Step n={4}>Complete it and return home</Step>
            <Link to="/participant/moment" onClick={() => setRole("participant")} className="btn-big mt-4 w-full bg-sage text-sage-foreground">Start as Jordan</Link>
          </Scenario>
        )}
        {tab === 1 && (
          <Scenario title="Family support" story="Sam wants to support their brother but isn't sure what to say.">
            <Step n={1}>Choose "I'm Here to Support Someone"</Step>
            <Step n={2}>Open "Learn How to Help" and read communication tips</Step>
            <Step n={3}>Open "Practice Together" → Loving-Kindness Together</Step>
            <div className="mt-4 grid gap-2">
              <Link to="/supporter/learn" onClick={() => setRole("supporter")} className="btn-big bg-primary text-primary-foreground">Start as Sam</Link>
              <Link to="/supporter/together/$id" params={{ id: "t-loving-kindness" }} onClick={() => setRole("supporter")} className="btn-big border-2 border-primary text-primary">Jump to Loving-Kindness Together</Link>
            </div>
          </Scenario>
        )}
        {tab === 2 && (
          <div>
            <DemoBanner />
            <p className="mb-4 text-lg">Jordan invites Sam, picks what to share, Sam accepts, Jordan confirms. Sam sees only what Jordan approved — and Jordan can revoke anytime.</p>
            <ParticipantShare />
            <div className="mt-4"><ConnectionFlow view="both" /></div>
          </div>
        )}
        {tab === 3 && (
          <Scenario title="AI Buddy" story="Jordan had a hard day looking for work and opens AI Buddy. (Practice mode: replies are scripted, not live AI.)">
            <Step n={1}>Say: "I've been trying to find a job, but I keep getting rejected."</Step>
            <Step n={2}>Open the memory page and turn memory on</Step>
            <Step n={3}>Say: "Remember that my goal is to find a stable job." → tap Remember This</Step>
            <Step n={4}>Say: "Can we do something to help me feel calmer?" → Start Grounding</Step>
            <Step n={5}>Tap Listen on a reply, or the microphone to speak</Step>
            <Link to="/participant/buddy" onClick={() => setRole("participant")} className="btn-big mt-4 w-full bg-sage text-sage-foreground">Open AI Buddy as Jordan</Link>
          </Scenario>
        )}
      </div>

      <button onClick={() => { setDemo(DEMO_DEFAULT); setTab(0); }} className="btn-big mt-8 w-full border-2 border-border text-primary">
        <RotateCcw className="size-5" /> Reset Demo
      </button>
    </Shell>
  );
}

function Scenario({ title, story, children }: { title: string; story: string; children: React.ReactNode }) {
  return (
    <div className="card-soft p-5">
      <h2 className="text-2xl font-semibold text-primary">{title}</h2>
      <p className="mt-1 text-lg text-muted-foreground">{story}</p>
      <ol className="mt-4 grid gap-2">{children}</ol>
    </div>
  );
}
function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-lg">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">{n}</span>
      {children}
    </li>
  );
}
