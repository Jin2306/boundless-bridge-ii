import { AlertCircle } from "lucide-react";

export function CrisisNote() {
  return (
    <div className="mt-6 flex gap-3 rounded-2xl border-2 border-destructive/40 bg-card p-5">
      <AlertCircle className="size-6 shrink-0 text-destructive" aria-hidden />
      <div className="text-lg">
        <p className="font-bold">If you are in immediate danger, call <a href="tel:911" className="underline">911</a>.</p>
        <p className="mt-1">For crisis support in the United States, call or text <a href="tel:988" className="font-bold underline">988</a>.</p>
        <p className="mt-1 text-base text-muted-foreground">These are external services. This app and BFP do not monitor emergencies.</p>
      </div>
    </div>
  );
}
