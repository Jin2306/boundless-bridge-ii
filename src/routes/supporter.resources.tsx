import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, Mail, Globe, Home, Briefcase, Users, Sprout, Heart } from "lucide-react";
import { Shell, PageTitle } from "@/components/Shell";
import { CrisisNote } from "@/components/CrisisNote";
import { BFP } from "@/lib/practices";

export const Route = createFileRoute("/supporter/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Boundless Bridge" },
      { name: "description", content: "Boundless Freedom Project contact, mindfulness practices, and general reentry guidance." },
      { property: "og:title", content: "Supporter Resources" },
      { property: "og:description", content: "Trusted contacts and general guidance for supporters." },
    ],
  }),
  component: Resources,
});

const TOPICS = [
  { icon: Home, title: "Housing support", text: "Ask what kind of help would be welcome. Local options vary — BFP may be able to suggest where to look." },
  { icon: Briefcase, title: "Employment support", text: "Offer practical help like rides or practice interviews, if wanted. Keep encouragement low-pressure." },
  { icon: Users, title: "Family relationships", text: "Rebuilding trust takes time. Short, consistent, kind contact often means more than big conversations." },
  { icon: Sprout, title: "Community connection", text: "Community spaces like BFP's Online Sangha can offer belonging. Invite, don't insist." },
  { icon: Heart, title: "Emotional well-being", text: "Mindfulness can help, but it's not a replacement for professional care. For crisis support, call or text 988." },
];

function Resources() {
  return (
    <Shell mode="supporter">
      <PageTitle title="Resources" subtitle="Trusted contacts and general guidance." />
      <section className="card-soft p-5">
        <h2 className="text-xl font-semibold text-primary">Boundless Freedom Project</h2>
        <p className="mt-1 text-lg">Mindfulness and community for people impacted by incarceration. BFP's materials describe a weekly Online Sangha — contact them to learn how to join.</p>
        <div className="mt-4 grid gap-2">
          <a href={BFP.tel} className="btn-big bg-primary text-primary-foreground"><Phone className="size-5" /> {BFP.phone}</a>
          <a href={`mailto:${BFP.email}`} className="btn-big border-2 border-primary text-primary"><Mail className="size-5" /> {BFP.email}</a>
          <a href={BFP.website} target="_blank" rel="noreferrer" className="btn-big border-2 border-primary text-primary"><Globe className="size-5" /> boundlessfreedom.org</a>
          <a href={BFP.sanghaMail} className="btn-big bg-sage text-sage-foreground"><Mail className="size-5" /> Ask about the Online Sangha</a>
        </div>
      </section>
      <section className="mt-4 card-soft p-5">
        <h2 className="text-xl font-semibold text-primary">Mindfulness practices</h2>
        <p className="mt-1 text-lg">The same practice library participants use, from the Buddhist Pathways Packet.</p>
        <Link to="/participant/practices" className="btn-big mt-3 w-full border-2 border-primary text-primary">Browse practices</Link>
      </section>
      <h2 className="mt-6 text-xl font-semibold text-primary">Reentry support — general guidance</h2>
      <div className="mt-3 grid gap-3">
        {TOPICS.map((t) => (
          <div key={t.title} className="card-soft flex gap-4 p-5">
            <t.icon className="size-7 shrink-0 text-sage" aria-hidden />
            <div><h3 className="text-lg font-semibold text-primary">{t.title}</h3><p className="text-base">{t.text}</p></div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-base text-muted-foreground">We don't list local organizations we haven't verified. Contact BFP for appropriate referrals.</p>
      <CrisisNote />
    </Shell>
  );
}
