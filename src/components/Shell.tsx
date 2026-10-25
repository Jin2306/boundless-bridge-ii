import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, Flower2, Users, BookOpen, HeartHandshake, LifeBuoy, Settings, WifiOff, ArrowLeft } from "lucide-react";

type NavItem = { to: string; label: string; icon: typeof Home };

const PARTICIPANT_NAV: NavItem[] = [
  { to: "/participant", label: "Home", icon: Home },
  { to: "/participant/practices", label: "Practices", icon: Flower2 },
  { to: "/participant/connect", label: "Connect", icon: Users },
];
const SUPPORTER_NAV: NavItem[] = [
  { to: "/supporter", label: "Home", icon: Home },
  { to: "/supporter/learn", label: "Learn", icon: BookOpen },
  { to: "/supporter/together", label: "Together", icon: HeartHandshake },
  { to: "/supporter/resources", label: "Resources", icon: LifeBuoy },
];

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function Footer() {
  return (
    <p className="px-6 pb-6 pt-10 text-center text-sm text-muted-foreground">
      Prototype developed for Hack for Social Impact 2026. Not an official Boundless Freedom Project service.
    </p>
  );
}

export function Shell({
  mode,
  children,
  back,
}: {
  mode?: "participant" | "supporter" | undefined;
  children: ReactNode;
  back?: string | undefined;
}) {
  const online = useOnline();
  const nav = mode === "participant" ? PARTICIPANT_NAV : mode === "supporter" ? SUPPORTER_NAV : null;
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col">
      <header className="flex items-center justify-between px-5 pt-5">
        {back ? (
          <Link to={back} className="flex min-h-12 items-center gap-2 rounded-full pr-3 text-base font-semibold text-primary">
            <ArrowLeft className="size-5" /> Back
          </Link>
        ) : (
          <Link to="/" className="font-display text-lg font-semibold text-primary">
            Boundless Bridge
          </Link>
        )}
        <div className="flex items-center gap-2">
          {!online && (
            <span className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-sm font-semibold text-gold-foreground" role="status">
              <WifiOff className="size-4" /> Offline
            </span>
          )}
          <Link to="/settings" aria-label="Settings" className="flex size-12 items-center justify-center rounded-full text-primary hover:bg-muted">
            <Settings className="size-6" />
          </Link>
        </div>
      </header>
      <main className={`flex-1 px-5 pt-4 ${nav ? "pb-28" : "pb-4"}`}>{children}</main>
      <Footer />
      {nav && (
        <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur">
          <ul className="mx-auto flex max-w-xl">
            {nav.map((n) => (
              <li key={n.to} className="flex-1">
                <Link
                  to={n.to}
                  activeOptions={{ exact: true }}
                  className="flex min-h-16 flex-col items-center justify-center gap-0.5 text-sm font-semibold text-muted-foreground data-[status=active]:text-primary"
                >
                  <n.icon className="size-6" />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold leading-tight text-primary">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
