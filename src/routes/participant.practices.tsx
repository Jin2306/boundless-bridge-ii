import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Clock } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { PRACTICES } from "@/lib/practices";
import { useFavorites } from "@/lib/store";

export const Route = createFileRoute("/participant/practices")({
  head: () => ({
    meta: [
      { title: "My Practices — Boundless Bridge" },
      { name: "description", content: "Mindfulness practices from the Buddhist Pathways Packet." },
      { property: "og:title", content: "My Practices" },
      { property: "og:description", content: "Familiar mindfulness practices, ready when you are." },
    ],
  }),
  component: Practices,
});

function Practices() {
  const [favs] = useFavorites();
  const sorted = [...PRACTICES].sort((a, b) => Number(favs.includes(b.id)) - Number(favs.includes(a.id)));
  return (
    <Shell mode="participant">
      <PageTitle title="My Practices" subtitle="Continue what you know." />
      <ul className="grid gap-3">
        {sorted.map((p) => (
          <li key={p.id}>
            <Link to="/participant/practice/$id" params={{ id: p.id }} className="block card-soft p-5 active:scale-[0.99]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-primary">{p.title}</h2>
                {favs.includes(p.id) && <Heart className="size-5 shrink-0 fill-current text-sage" aria-label="Favorite" />}
              </div>
              <p className="mt-1 text-lg">{p.summary}</p>
              <p className="mt-2 flex items-center gap-1 text-base text-muted-foreground"><Clock className="size-4" /> {p.minutes} min</p>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
