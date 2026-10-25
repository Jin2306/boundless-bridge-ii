import { createFileRoute, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { PracticePlayer } from "@/components/PracticePlayer";
import { getPractice } from "@/lib/practices";

export const Route = createFileRoute("/supporter/together/$id")({
  loader: ({ params }) => {
    const p = getPractice(params.id);
    if (!p) throw notFound();
    return { title: p.title, summary: p.summary };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Together"} — Boundless Bridge` },
      { name: "description", content: loaderData?.summary ?? "A shared mindfulness activity." },
      { property: "og:title", content: loaderData?.title ?? "A Moment Together" },
      { property: "og:description", content: loaderData?.summary ?? "A shared mindfulness activity." },
    ],
  }),
  component: TogetherPractice,
});

function TogetherPractice() {
  const { id } = Route.useParams();
  return (
    <Shell back="/supporter/together">
      <PracticePlayer key={id} practice={getPractice(id)!} mode="supporter" />
    </Shell>
  );
}
