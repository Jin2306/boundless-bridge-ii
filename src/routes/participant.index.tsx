import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Flower2, Users, BookHeart, Sparkles } from "lucide-react";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/participant/")({
  head: () => ({
    meta: [
      { title: "Home — Boundless Bridge" },
      { name: "description", content: "Find calm, continue your practice, or talk to someone." },
      { property: "og:title", content: "Boundless Bridge — Participant" },
      { property: "og:description", content: "Find calm, continue your practice, or talk to someone." },
    ],
  }),
  component: ParticipantHome,
});

function Big({ to, icon: Icon, title, desc, cls }: { to: string; icon: typeof Heart; title: string; desc: string; cls: string }) {
  return (
    <Link to={to} className={`flex min-h-28 items-center gap-5 rounded-3xl p-6 shadow-lift transition active:scale-[0.99] ${cls}`}>
      <Icon className="size-12 shrink-0" aria-hidden />
      <span>
        <span className="block font-display text-2xl font-semibold">{title}</span>
        <span className="block text-lg opacity-95">{desc}</span>
      </span>
    </Link>
  );
}

function ParticipantHome() {
  return (
    <Shell mode="participant">
      <h1 className="text-3xl font-semibold text-primary">Welcome. We're glad you're here.</h1>
      <p className="mt-2 text-xl text-muted-foreground">How can we help you today?</p>
      <div className="mt-6 grid gap-4">
        <Big to="/participant/moment" icon={Heart} title="I Need a Moment" desc="Find calm right now." cls="bg-sage text-sage-foreground" />
        <Big to="/participant/practices" icon={Flower2} title="My Practices" desc="Continue what you know." cls="bg-primary text-primary-foreground" />
        <Big to="/participant/connect" icon={Users} title="Talk to Someone" desc="Find human support." cls="bg-gold text-gold-foreground" />
      </div>
      <div className="mt-6 flex justify-center gap-6">
        <Link to="/participant/journey" className="flex min-h-12 items-center gap-2 font-semibold text-primary"><BookHeart className="size-5" /> My Journey</Link>
        <Link to="/guide" className="flex min-h-12 items-center gap-2 font-semibold text-primary"><Sparkles className="size-5" /> Practice Guide</Link>
      </div>
    </Shell>
  );
}
