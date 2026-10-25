import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell, PageTitle } from "@/components/Shell";
import { clearAllLocalData, useRole, useSettings, type Settings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Boundless Bridge" },
      { name: "description", content: "Accessibility, privacy, and role settings." },
      { property: "og:title", content: "Settings" },
      { property: "og:description", content: "Accessibility and privacy controls." },
    ],
  }),
  component: SettingsPage,
});

const TOGGLES: { k: keyof Settings; label: string }[] = [
  { k: "largeText", label: "Larger text" },
  { k: "highContrast", label: "High contrast" },
  { k: "reduceMotion", label: "Reduce animation" },
  { k: "audio", label: "Audio guidance (Listen button)" },
  { k: "aiConsent", label: "Allow Practice Guide (AI)" },
];

function SettingsPage() {
  const [settings, setSettings] = useSettings();
  const [role, setRole] = useRole();
  const navigate = useNavigate();
  return (
    <Shell mode={role ?? undefined} back={role === "supporter" ? "/supporter" : role === "participant" ? "/participant" : "/"}>
      <PageTitle title="Settings" />
      <section className="card-soft p-5">
        <h2 className="text-xl font-semibold text-primary">Who is using the app?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["participant", "supporter"] as const).map((r) => (
            <button key={r} aria-pressed={role === r}
              onClick={() => { setRole(r); navigate({ to: r === "participant" ? "/participant" : "/supporter" }); }}
              className={`btn-big ${role === r ? "bg-primary text-primary-foreground" : "border-2 border-border text-primary"}`}>
              {r === "participant" ? "For myself" : "Supporter"}
            </button>
          ))}
        </div>
      </section>
      <section className="mt-4 card-soft p-5">
        <h2 className="text-xl font-semibold text-primary">Accessibility</h2>
        <div className="mt-3 grid gap-2">
          {TOGGLES.map((t) => (
            <label key={t.k} className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-border px-4 text-lg">
              {t.label}
              <input type="checkbox" className="size-6 accent-[var(--color-primary)]" checked={settings[t.k]}
                onChange={(e) => setSettings({ ...settings, [t.k]: e.target.checked })} />
            </label>
          ))}
        </div>
      </section>
      <section className="mt-4 card-soft p-5">
        <h2 className="text-xl font-semibold text-primary">Privacy</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-lg">
          <li>No account needed. You can use the app anonymously.</li>
          <li>Reflections, favorites, and history stay on this device only.</li>
          <li>We never ask for criminal history, location, or ID numbers.</li>
          <li>Nothing is shared with anyone unless you choose to.</li>
          <li>No advertising trackers.</li>
          <li>Practice Guide messages go to an AI service only after you agree.</li>
        </ul>
        <p className="mt-3 text-base text-muted-foreground">This is a hackathon prototype. It is not certified for sensitive data.</p>
        <button
          onClick={() => { if (confirm("Delete all reflections, favorites, history, and settings on this device?")) { clearAllLocalData(); navigate({ to: "/" }); } }}
          className="btn-big mt-4 w-full border-2 border-destructive text-destructive">
          Clear all my data
        </button>
      </section>
    </Shell>
  );
}
