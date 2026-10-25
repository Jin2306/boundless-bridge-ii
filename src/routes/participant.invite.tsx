import { createFileRoute } from "@tanstack/react-router";
import { Shell, PageTitle } from "@/components/Shell";
import { ConnectionFlow, DemoBanner, InviteShareButton, ParticipantShare } from "@/components/ConnectionDemo";

export const Route = createFileRoute("/participant/invite")({
  head: () => ({
    meta: [
      { title: "Invite Someone I Trust — Boundless Bridge" },
      { name: "description", content: "Invite a supporter and choose exactly what to share." },
      { property: "og:title", content: "Invite Someone I Trust" },
      { property: "og:description", content: "You decide what to share." },
    ],
  }),
  component: Invite,
});

function Invite() {
  return (
    <Shell mode="participant" back="/participant/connect">
      <PageTitle title="Invite Someone I Trust" subtitle="You decide what to share. You can stop anytime." />
      <InviteShareButton />
      <p className="mt-2 text-base text-muted-foreground">This sends a friendly message only. It does not link accounts or share your data.</p>
      <div className="mt-6"><DemoBanner /></div>
      <ParticipantShare />
      <div className="mt-4"><ConnectionFlow view="participant" /></div>
    </Shell>
  );
}
