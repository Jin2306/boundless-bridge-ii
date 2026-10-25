import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Users } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { TOGETHER } from "@/lib/practices";

export const Route = createFileRoute("/supporter/together/")({
  head: () => ({
    meta: [
      { title: "A Moment Together — Boundless Bridge" },
      { name: "description", content: "Short mindfulness activities two people can do on one phone." },
      { property: "og:title", content: "A Moment Together" },
      { property: "og:description", content: "Mindfulness activities for two, on one phone." },
    ],
  }),
  component: Together,
});

function Together() {
  return (
    <Shell mode="supporter">
      <PageTitle title="A Moment Together" subtitle="Sit side by side. One phone is all you need." />
      <ul className="grid gap-3">
        {TOGETHER.map((p) => (
          <li key={p.id}>
            <Link to="/supporter/together/$id" params={{ id: p.id }} className="block card-soft p-5 active:scale-[0.99]">
              <h2 className="text-xl font-semibold text-primary">{p.title}</h2>
              <p className="mt-1 text-lg">{p.summary}</p>
              <p className="mt-2 flex items-center gap-3 text-base text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="size-4" /> {p.minutes} min</span>
                <span className="flex items-center gap-1"><Users className="size-4" /> For two</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
