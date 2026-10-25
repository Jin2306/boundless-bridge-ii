import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { useBuddySettings, useMemories } from "@/lib/buddy";

export const Route = createFileRoute("/participant/buddy/memory")({
  head: () => ({
    meta: [
      { title: "What AI Buddy Remembers — Boundless Bridge" },
      { name: "description", content: "Review, delete, or turn off what AI Buddy remembers. You're in control." },
      { property: "og:title", content: "What AI Buddy Remembers" },
      { property: "og:description", content: "You're in control of AI Buddy's memory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MemoryPage,
});

function MemoryPage() {
  const [settings, setSettings] = useBuddySettings();
  const [memories, setMemories] = useMemories();
  return (
    <Shell mode="participant" back="/participant/buddy">
      <PageTitle title="What AI Buddy Remembers" subtitle="You're in control." />
      <section className="card-soft p-5">
        <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 text-lg font-semibold">
          Memory {settings.memory ? "is on" : "is off"}
          <input type="checkbox" className="size-6 accent-[var(--color-primary)]" checked={settings.memory}
            onChange={(e) => setSettings({ ...settings, memory: e.target.checked })} />
        </label>
        <p className="text-base text-muted-foreground">
          When memory is on, AI Buddy asks before saving anything. When it's off, nothing new is saved — memories you already saved stay here until you delete them.
          Memories live only on this device and are never shared with supporters.
          When memory is on and you're online, saved notes are sent with your messages so AI Buddy can write replies that fit you. Offline, the on-device AI uses them without anything leaving this phone. Turn memory off and nothing is used.
        </p>
      </section>

      {memories.length === 0 ? (
        <p className="mt-6 text-lg text-muted-foreground">Nothing saved yet. Try saying "Remember that my goal is to find a stable job."</p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {memories.map((m) => (
            <li key={m.id} className="card-soft flex items-start gap-3 p-5">
              <div className="flex-1">
                <p className="text-lg">{m.text}</p>
                <p className="mt-1 text-sm text-muted-foreground">Saved {new Date(m.date).toLocaleDateString()}</p>
              </div>
              <button aria-label={`Delete memory: ${m.text}`} onClick={() => setMemories((p) => p.filter((x) => x.id !== m.id))}
                className="flex size-12 items-center justify-center rounded-full text-destructive hover:bg-muted"><Trash2 className="size-5" /></button>
            </li>
          ))}
        </ul>
      )}
      {memories.length > 0 && (
        <button onClick={() => { if (confirm("Delete all of AI Buddy's memories?")) setMemories([]); }}
          className="btn-big mt-6 w-full border-2 border-destructive text-destructive">Delete All Memories</button>
      )}
    </Shell>
  );
}
