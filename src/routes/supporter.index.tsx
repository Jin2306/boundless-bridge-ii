import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, HeartHandshake, Link2, LifeBuoy, Sparkles } from "lucide-react";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/supporter/")({
  head: () => ({
    meta: [
      { title: "Supporting Someone Through Reentry — Boundless Bridge" },
      { name: "description", content: "Learn how to help, practice mindfulness together, and find trusted resources." },
      { property: "og:title", content: "Supporting Someone Through Reentry" },
      { property: "og:description", content: "Small moments of understanding can make a meaningful difference." },
    ],
  }),
  component: SupporterHome,
});

const CARDS = [
  { to: "/supporter/learn", icon: BookOpen, title: "Learn How to Help", desc: "Understanding reentry and supportive communication." },
  { to: "/supporter/together", icon: HeartHandshake, title: "Practice Together", desc: "Short mindfulness activities for two, on one phone." },
  { to: "/supporter/connect", icon: Link2, title: "Connect With My Participant", desc: "Consent-based. They choose what to share." },
  { to: "/supporter/resources", icon: LifeBuoy, title: "Find Resources", desc: "Boundless Freedom Project and general guidance." },
];

function SupporterHome() {
  return (
    <Shell mode="supporter">
      <h1 className="text-3xl font-semibold leading-tight text-primary">Supporting Someone Through Reentry</h1>
      <p className="mt-2 text-lg text-muted-foreground">Small moments of understanding can make a meaningful difference.</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="card-soft p-5 transition hover:shadow-lift active:scale-[0.99]">
            <c.icon className="size-9 text-sage" aria-hidden />
            <h2 className="mt-3 text-xl font-semibold text-primary">{c.title}</h2>
            <p className="mt-1 text-base text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
      <Link to="/guide" className="mt-4 flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-soft">
        <Sparkles className="size-8" aria-hidden />
        <span><span className="block text-lg font-bold">Ask the Practice Guide</span><span className="block text-base opacity-90">Optional AI suggestions for supporting someone.</span></span>
      </Link>
    </Shell>
  );
}
