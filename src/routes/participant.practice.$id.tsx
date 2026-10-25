import { createFileRoute, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { PracticePlayer } from "@/components/PracticePlayer";
import { getPractice } from "@/lib/practices";

export const Route = createFileRoute("/participant/practice/$id")({
  loader: ({ params }) => {
    const p = getPractice(params.id);
    if (!p) throw notFound();
    return { title: p.title, summary: p.summary };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Practice"} — Boundless Bridge` },
      { name: "description", content: loaderData?.summary ?? "A guided mindfulness practice." },
      { property: "og:title", content: loaderData?.title ?? "Practice" },
      { property: "og:description", content: loaderData?.summary ?? "A guided mindfulness practice." },
    ],
  }),
  component: PracticePage,
});

function PracticePage() {
  const { id } = Route.useParams();
  const p = getPractice(id)!;
  return (
    <Shell back="/participant/practices">
      <PracticePlayer key={id} practice={p} mode="participant" />
    </Shell>
  );
}
