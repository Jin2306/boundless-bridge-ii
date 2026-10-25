import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Lock } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { getPractice } from "@/lib/practices";
import { useCompleted, useFavorites, useReflections } from "@/lib/store";

export const Route = createFileRoute("/participant/journey")({
  head: () => ({
    meta: [
      { title: "My Journey — Boundless Bridge" },
      { name: "description", content: "Private reflections and favorite practices, stored only on this device." },
      { property: "og:title", content: "My Journey" },
      { property: "og:description", content: "Private reflections, stored only on this device." },
    ],
  }),
  component: Journey,
});

function Journey() {
  const [reflections, setReflections] = useReflections();
  const [favs] = useFavorites();
  const [completed] = useCompleted();
  const [text, setText] = useState("");

  const save = () => {
    if (!text.trim()) return;
    setReflections((r) => [{ id: crypto.randomUUID(), text: text.trim(), date: new Date().toISOString() }, ...r]);
    setText("");
  };

  return (
    <Shell mode="participant" back="/participant">
      <PageTitle title="My Journey" />
      <p className="-mt-3 mb-5 flex items-center gap-2 text-base text-muted-foreground"><Lock className="size-4" /> Private. Saved only on this phone. Never shared.</p>

      <section className="card-soft p-5">
        <label htmlFor="ref" className="font-display text-xl font-semibold text-primary">What helped you today?</label>
        <textarea id="ref" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000}
          className="mt-3 w-full rounded-xl border-2 border-input bg-background p-3 text-lg" placeholder="Write a few words, if you like." />
        <button onClick={save} disabled={!text.trim()} className="btn-big mt-3 w-full bg-primary text-primary-foreground disabled:opacity-50">Save reflection</button>
      </section>

      {reflections.length > 0 && (
        <ul className="mt-4 grid gap-3" aria-label="My reflections">
          {reflections.map((r) => (
            <li key={r.id} className="card-soft flex gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>
                <p className="text-lg">{r.text}</p>
              </div>
              <button aria-label="Delete reflection" onClick={() => setReflections((all) => all.filter((x) => x.id !== r.id))}
                className="flex size-12 items-center justify-center rounded-full text-destructive hover:bg-muted">
                <Trash2 className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-xl font-semibold text-primary">Favorite practices</h2>
      {favs.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {favs.map((id) => getPractice(id) && (
            <Link key={id} to="/participant/practice/$id" params={{ id }} className="min-h-12 rounded-full bg-secondary px-4 py-3 font-semibold text-secondary-foreground">
              {getPractice(id)!.title}
            </Link>
          ))}
        </div>
      ) : <p className="mt-2 text-lg text-muted-foreground">Tap the heart on any practice to save it here.</p>}

      <h2 className="mt-8 text-xl font-semibold text-primary">Moments you took</h2>
      {completed.length ? (
        <ul className="mt-2 grid gap-1 text-lg">
          {completed.slice(0, 8).map((c, i) => (
            <li key={i}>{getPractice(c.id)?.title ?? c.id} <span className="text-muted-foreground">· {new Date(c.date).toLocaleDateString()}</span></li>
          ))}
        </ul>
      ) : <p className="mt-2 text-lg text-muted-foreground">Nothing yet — and that's okay.</p>}

      <Link to="/settings" className="mt-6 inline-flex min-h-12 items-center font-semibold text-primary underline">Clear all my data in Settings</Link>
    </Shell>
  );
}
