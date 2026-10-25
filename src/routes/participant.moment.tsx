import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageTitle } from "@/components/Shell";
import { FEELINGS } from "@/lib/practices";

export const Route = createFileRoute("/participant/moment")({
  head: () => ({
    meta: [
      { title: "I Need a Moment — Boundless Bridge" },
      { name: "description", content: "Tell us what's happening and start a short calming practice." },
      { property: "og:title", content: "I Need a Moment" },
      { property: "og:description", content: "A short calming practice, right now." },
    ],
  }),
  component: Moment,
});

function Moment() {
  return (
    <Shell mode="participant" back="/participant">
      <PageTitle title="What's happening right now?" />
      <div className="grid gap-3">
        {FEELINGS.map((f) => (
          <Link
            key={f.id}
            to="/participant/practice/$id"
            params={{ id: f.practice }}
            className="flex min-h-16 items-center rounded-2xl card-soft px-6 text-xl font-semibold text-primary active:scale-[0.99]"
          >
            {f.label}
          </Link>
        ))}
      </div>
      <Link to="/participant/practice/$id" params={{ id: "grounding" }} className="mt-5 flex min-h-12 items-center justify-center text-lg font-semibold text-muted-foreground underline">
        Skip — just start
      </Link>
    </Shell>
  );
}
