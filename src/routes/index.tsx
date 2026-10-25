import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartHandshake, PersonStanding, PlayCircle } from "lucide-react";
import { Footer } from "@/components/Shell";
import { useRole } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boundless Bridge — Choose your experience" },
      { name: "description", content: "Find calm and stay connected, or learn how to support someone through reentry." },
      { property: "og:title", content: "Welcome to Boundless Bridge" },
      { property: "og:description", content: "Your practice. Your people. Your next chapter." },
    ],
  }),
  component: Index,
});

function Index() {
  const [, setRole] = useRole();
  const navigate = useNavigate();
  const go = (r: "participant" | "supporter") => {
    setRole(r);
    navigate({ to: r === "participant" ? "/participant" : "/supporter" });
  };
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 pt-12">
      <p className="font-display text-lg text-sage">Boundless Bridge</p>
      <h1 className="mt-2 text-4xl font-semibold leading-tight text-primary">Welcome to Boundless Bridge</h1>
      <p className="mt-3 font-display text-xl text-foreground">Your practice. Your people. Your next chapter.</p>
      <p className="mt-2 text-lg text-muted-foreground">Supporting mindfulness, connection, and community through life's transitions.</p>

      <div className="mt-8 grid gap-4">
        <button onClick={() => go("participant")} className="rounded-3xl bg-sage p-6 text-left text-sage-foreground shadow-lift transition active:scale-[0.99]">
          <PersonStanding className="size-12" aria-hidden />
          <h2 className="mt-3 text-2xl font-semibold">I'm Here for Myself</h2>
          <p className="mt-1 text-lg opacity-95">Find calm, continue your practice, and stay connected.</p>
          <span className="mt-4 inline-flex min-h-12 items-center rounded-full bg-card px-5 font-bold text-primary">Continue as Participant</span>
        </button>
        <button onClick={() => go("supporter")} className="rounded-3xl border-2 border-gold bg-card p-6 text-left shadow-soft transition active:scale-[0.99]">
          <HeartHandshake className="size-12 text-primary" aria-hidden />
          <h2 className="mt-3 text-2xl font-semibold text-primary">I'm Here to Support Someone</h2>
          <p className="mt-1 text-lg text-muted-foreground">Learn how to help, practice together, and stay connected.</p>
          <span className="mt-4 inline-flex min-h-12 items-center rounded-full bg-gold px-5 font-bold text-gold-foreground">Continue as Supporter</span>
        </button>
      </div>
      <p className="mt-6 text-center text-lg text-muted-foreground">Explore without creating an account.</p>
      <Link to="/demo" className="mx-auto mt-3 flex min-h-12 items-center gap-2 font-semibold text-primary underline-offset-4 hover:underline">
        <PlayCircle className="size-5" /> Hackathon demo mode
      </Link>
      <div className="flex-1" />
      <Footer />
    </div>
  );
}
