import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, PageTitle } from "@/components/Shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/supporter/learn")({
  head: () => ({
    meta: [
      { title: "Learn How to Help — Boundless Bridge" },
      { name: "description", content: "Practical, compassionate guidance for supporting someone returning home." },
      { property: "og:title", content: "Learn How to Help" },
      { property: "og:description", content: "Practical, compassionate guidance for supporters." },
    ],
  }),
  component: Learn,
});

const SECTIONS = [
  {
    id: "reentry",
    title: "Understanding Reentry",
    intro: "Coming home can bring many changes at once. Not everyone faces the same things, but common challenges include:",
    items: ["Finding stable housing", "Finding work", "Rebuilding relationships", "Adjusting to everyday responsibilities", "Managing stress", "Reconnecting with community"],
    note: "Let the person tell you what's hard for them, rather than assuming.",
  },
  {
    id: "communication",
    title: "Supportive Communication",
    intro: "How we say things matters as much as what we say.",
    items: ["Listen without judgment", "Ask before giving advice", "Respect boundaries", "Don't pressure someone to share past experiences", "Offer practical help", "Remember: their choices are theirs"],
    swaps: [
      ["You need to calm down.", "Would it help if we took a moment together?"],
      ["You should apply for that job.", "Would you like help with anything for your search?"],
      ["Why didn't you call me?", "I'm glad to hear from you whenever you're ready."],
    ],
  },
  {
    id: "mindfulness",
    title: "Supporting Mindfulness",
    intro: "Many people learned mindfulness through Boundless Freedom Project. Familiar practices can feel steadying.",
    items: [
      "Grounding brings attention to the senses — feet, sounds, sights — which can ease a racing mind.",
      "Breathing together works best when no one forces a rhythm. Just breathe naturally, side by side.",
      "Offer, don't push. \"Want to take two minutes together?\" is enough.",
      "Familiar practices may carry meaning from a hard time. Let them lead.",
    ],
  },
  {
    id: "difficult",
    title: "Helping During Difficult Moments",
    intro: "General suggestions only — not professional, clinical, or legal advice.",
    items: [
      "Overwhelm: lower the pace. Offer quiet, water, or a short grounding practice.",
      "Family disagreements: pause and return later. \"Let's take a breath and come back to this.\"",
      "Before an interview: offer encouragement and a two-minute grounding, not a lecture.",
      "Feeling isolated: invite, without pressure — a walk, a meal, the Online Sangha.",
      "Trouble sleeping: a body scan may help. Respect their routine.",
      "If someone is in danger, call 911. For crisis support, call or text 988.",
    ],
  },
];

function Learn() {
  return (
    <Shell mode="supporter">
      <PageTitle title="Learn How to Help" subtitle="Simple, respectful ways to show up." />
      <Accordion type="single" collapsible defaultValue="communication" className="grid gap-3">
        {SECTIONS.map((s) => (
          <AccordionItem key={s.id} value={s.id} className="card-soft border-b-0 px-5">
            <AccordionTrigger className="py-5 font-display text-xl font-semibold text-primary hover:no-underline">{s.title}</AccordionTrigger>
            <AccordionContent className="text-lg">
              <p>{s.intro}</p>
              <ul className="mt-3 list-disc space-y-1 pl-6">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
              {s.note && <p className="mt-3 text-muted-foreground">{s.note}</p>}
              {s.swaps && (
                <div className="mt-4 grid gap-3">
                  {s.swaps.map(([a, b]) => (
                    <div key={a} className="rounded-xl bg-secondary p-4">
                      <p className="text-base text-muted-foreground line-through">"{a}"</p>
                      <p className="mt-1 font-semibold text-secondary-foreground">Try: "{b}"</p>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Link to="/supporter/together" className="btn-big mt-6 w-full bg-sage text-sage-foreground">Try a practice together</Link>
    </Shell>
  );
}
