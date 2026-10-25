import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Mail, Globe, Users, UserPlus } from "lucide-react";
import { CrisisNote } from "@/components/CrisisNote";
import { Shell, PageTitle } from "@/components/Shell";
import { BFP } from "@/lib/practices";

export const Route = createFileRoute("/participant/connect")({
  head: () => ({
    meta: [
      { title: "Talk to Someone — Boundless Bridge" },
      { name: "description", content: "Contact Boundless Freedom Project, join the community, or invite someone you trust." },
      { property: "og:title", content: "You're Not Alone" },
      { property: "og:description", content: "Connection is part of the practice." },
    ],
  }),
  component: Connect,
});

function Connect() {
  return (
    <Shell mode="participant">
      <PageTitle title="You're Not Alone" subtitle="Connection is part of the practice." />
      <section className="card-soft p-6">
        <h2 className="text-2xl font-semibold text-primary">Boundless Freedom Project</h2>
        <p className="mt-1 text-lg text-muted-foreground">{BFP.phone} · {BFP.email}</p>
        <div className="mt-4 grid gap-3">
          <a href={BFP.tel} className="btn-big bg-primary text-primary-foreground"><Phone className="size-6" /> Call BFP</a>
          <a href={`mailto:${BFP.email}`} className="btn-big border-2 border-primary text-primary"><Mail className="size-6" /> Email</a>
          <a href={BFP.website} target="_blank" rel="noreferrer" className="btn-big border-2 border-primary text-primary"><Globe className="size-6" /> Visit Website</a>
        </div>
      </section>
      <section className="mt-4 card-soft p-6">
        <Users className="size-9 text-sage" aria-hidden />
        <h2 className="mt-2 text-2xl font-semibold text-primary">Online Sangha</h2>
        <p className="mt-1 text-lg">Connect with a community practicing mindfulness together.</p>
        <a href={BFP.sanghaMail} className="btn-big mt-4 w-full bg-sage text-sage-foreground"><Mail className="size-6" /> Ask BFP How to Join</a>
      </section>
      <section className="mt-4 card-soft p-6">
        <UserPlus className="size-9 text-gold" aria-hidden />
        <h2 className="mt-2 text-2xl font-semibold text-primary">Connect With My Supporter</h2>
        <p className="mt-1 text-lg">You decide what to share. This is optional.</p>
        <Link to="/participant/invite" className="btn-big mt-4 w-full bg-gold text-gold-foreground">Invite Someone I Trust</Link>
      </section>
      <CrisisNote />
    </Shell>
  );
}
