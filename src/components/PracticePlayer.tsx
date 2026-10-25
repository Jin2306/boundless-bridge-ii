import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, X, Heart, Flower2 } from "lucide-react";
import type { Practice } from "@/lib/practices";
import { markCompleted, speak, stopSpeaking, useFavorites, useSettings } from "@/lib/store";

export function PracticePlayer({ practice, mode }: { practice: Practice; mode: "participant" | "supporter" }) {
  const [step, setStep] = useState(-1); // -1 = intro
  const [paused, setPaused] = useState(false);
  const [favs, setFavs] = useFavorites();
  const [settings] = useSettings();
  const navigate = useNavigate();
  const home = mode === "participant" ? "/participant" : "/supporter";
  const done = step >= practice.steps.length;
  const isFav = favs.includes(practice.id);

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    if (done) markCompleted(practice.id);
  }, [done, practice.id]);

  const text = step >= 0 && !done ? (practice.steps[step] ?? "") : "";

  if (done) {
    return (
      <div className="flex flex-col items-center pt-8 text-center">
        <div className="mb-6 flex size-28 items-center justify-center rounded-full bg-secondary">
          <Flower2 className="size-14 text-sage" />
        </div>
        <h1 className="text-3xl font-semibold text-primary">
          {practice.together ? "You took a moment together." : "You took a moment for yourself."}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">Would you like to do anything else?</p>
        <div className="mt-8 grid w-full gap-3">
          <Link to={mode === "participant" ? "/participant/practices" : "/supporter/together"} className="btn-big bg-primary text-primary-foreground">
            Another Practice
          </Link>
          <Link to={mode === "participant" ? "/participant/connect" : "/supporter/resources"} className="btn-big bg-gold text-gold-foreground">
            Talk to Someone
          </Link>
          <Link to={home} className="btn-big border-2 border-primary text-primary">
            Finish
          </Link>
        </div>
      </div>
    );
  }

  if (step === -1) {
    return (
      <div className="pt-2">
        <div className="card-soft p-6">
          <div className="mx-auto mb-5 flex size-32 items-center justify-center rounded-full bg-secondary">
            <div className="size-20 rounded-full bg-sage/70 animate-breathe" aria-hidden />
          </div>
          <h1 className="text-center text-3xl font-semibold text-primary">{practice.title}</h1>
          <p className="mt-2 text-center text-lg text-muted-foreground">{practice.minutes} minutes · {practice.steps.length} steps</p>
          <p className="mt-4 text-center text-lg">{practice.summary}</p>
          <button onClick={() => setStep(0)} className="btn-big mt-6 w-full bg-sage text-sage-foreground">
            <Play className="size-6" /> Start
          </button>
          {mode === "participant" && (
            <button
              onClick={() => setFavs((f) => (f.includes(practice.id) ? f.filter((x) => x !== practice.id) : [...f, practice.id]))}
              aria-pressed={isFav}
              className="btn-big mt-3 w-full border-2 border-border text-primary"
            >
              <Heart className={`size-6 ${isFav ? "fill-current" : ""}`} /> {isFav ? "Saved to favorites" : "Save to favorites"}
            </button>
          )}
          <p className="mt-5 text-center text-sm text-muted-foreground">Source: {practice.source}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-muted-foreground">
          Step {step + 1} of {practice.steps.length}
        </p>
        <button
          onClick={() => { stopSpeaking(); navigate({ to: home }); }}
          className="flex min-h-12 items-center gap-1 rounded-full px-3 font-semibold text-primary"
        >
          <X className="size-5" /> Exit
        </button>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-sage transition-all" style={{ width: `${((step + 1) / practice.steps.length) * 100}%` }} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="mb-8 flex size-36 items-center justify-center rounded-full bg-secondary">
          <div className={`size-24 rounded-full bg-sage/70 ${paused ? "" : "animate-breathe"}`} aria-hidden />
        </div>
        <p className="font-display text-3xl leading-snug text-foreground" aria-live="polite">
          {paused ? "Paused. Take your time." : text}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-mid disabled:opacity-40">
          <ChevronLeft className="size-6" /> Back
        </button>
        <button onClick={() => { setPaused((p) => !p); stopSpeaking(); }} className="btn-mid">
          {paused ? <Play className="size-6" /> : <Pause className="size-6" />} {paused ? "Resume" : "Pause"}
        </button>
        {settings.audio ? (
          <button onClick={() => speak(text)} className="btn-mid" disabled={paused}>
            <Volume2 className="size-6" /> Listen
          </button>
        ) : <span />}
      </div>
      <button
        onClick={() => { stopSpeaking(); setPaused(false); setStep((s) => s + 1); }}
        className="btn-big mt-3 w-full bg-primary text-primary-foreground"
      >
        {step === practice.steps.length - 1 ? "Finish" : "Next"} <ChevronRight className="size-6" />
      </button>
    </div>
  );
}
