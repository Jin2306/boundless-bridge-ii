/**
 * On-device AI Buddy using Gemma (runs in the browser via WebGPU, no internet
 * needed once downloaded). Nothing typed here — including memories — ever
 * leaves the device. Browser-only: import lazily from effects/handlers.
 */
import { memoryCandidate, mockReply, type BuddyAiReply } from "./buddy";

export const GEMMA_MODEL = "gemma-2-2b-it-q4f16_1-MLC";
export const GEMMA_SIZE = "about 1.4 GB";

type Engine = { chat: { completions: { create: (r: unknown) => Promise<{ choices: { message: { content: string | null } }[] }> } } };
let engine: Engine | null = null;
let loading: Promise<Engine> | null = null;

export function gemmaSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/** Downloads (first time, cached by the browser afterwards) and loads Gemma. */
export function loadGemma(onProgress?: (pct: number, text: string) => void): Promise<Engine> {
  if (engine) return Promise.resolve(engine);
  if (!loading) {
    loading = import("@mlc-ai/web-llm")
      .then((m) =>
        m.CreateMLCEngine(GEMMA_MODEL, {
          initProgressCallback: (p) => onProgress?.(Math.round(p.progress * 100), p.text),
        }),
      )
      .then((e) => (engine = e as unknown as Engine))
      .catch((err) => {
        loading = null;
        throw err;
      });
  }
  return loading;
}

const RULES = `You are "AI Buddy", a warm companion for people in life transitions. Reply in 1-3 short plain sentences (under 60 words), listen first, at most one gentle question. You are not a therapist; never give medical or legal advice; never invent services. Only crisis resources: 988 (call or text, U.S.) and 911.`;

export async function gemmaReply(
  message: string,
  opts: { history: { role: "user" | "buddy"; text: string }[]; memories: string[]; memoryOn: boolean; turn: number },
): Promise<BuddyAiReply> {
  // Safety and practice suggestions stay rule-based for reliability on a small model.
  const scripted = mockReply(message, { memoryOn: opts.memoryOn, turn: opts.turn });
  if (scripted.crisis) return scripted;
  const e = await loadGemma();
  let sys = RULES;
  if (opts.memoryOn && opts.memories.length) sys += `\nNotes the person saved (use naturally, don't recite):\n${opts.memories.map((m) => `- ${m}`).join("\n")}`;
  const res = await e.chat.completions.create({
    messages: [
      { role: "system", content: sys },
      ...opts.history.slice(-6).map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
      { role: "user", content: message },
    ],
    max_tokens: 160,
    temperature: 0.7,
  });
  const text = res.choices[0]?.message.content?.trim();
  if (!text) throw new Error("empty");
  const cand = opts.memoryOn ? memoryCandidate(message) : undefined;
  return {
    text,
    practiceId: scripted.practiceId,
    offerTalk: scripted.offerTalk,
    crisis: false,
    memoryCandidate: cand,
  };
}
