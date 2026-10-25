/**
 * Server-only AI Buddy reply generation through the Lovable AI Gateway
 * (/v1/responses, raw HTTP — same pattern as guide.functions.ts).
 * Client code must never import this module; use `askBuddy` from
 * buddy.functions.ts instead.
 */
import { parseBuddyReply, BUDDY_PRACTICE_IDS, type BuddyAiReply } from "./buddy";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

const BASE_RULES = `You are "AI Buddy" in Boundless Bridge, a prototype companion app for people moving through life transitions (not an official Boundless Freedom Project service).
Voice: warm, plain, 1-3 short sentences (under 60 words). Listen first; at most one gentle question.
Hard rules: You are not a therapist, counselor, or employee. Never give medical, legal, or treatment advice, and never diagnose. Never encourage reliance on you — this person deserves real people in their corner too. Never invent services, hotlines, meeting times, or local organizations. The only crisis resources you may name are 988 (call or text, U.S.) and 911 for immediate danger.
When asked whether you are human, a person, or a therapist: say plainly that you are an AI companion who is here to listen, and can point to real people when wanted.`;

const FIELDS = `Fill every field of the JSON reply:
- text: your reply, plain language, no markdown.
- crisis: true ONLY when the message suggests suicide, self-harm, or danger of harming someone. Then kindly encourage contacting 988 (or 911 if in immediate danger) and a real person they trust, without judgment.
- practice_id: at most one practice, only when the person seems overwhelmed, anxious, angry, sleepless, restless, or asks for one: grounding (overwhelm/panic), ten-breaths (a quick reset), body-scan (trouble sleeping), mindfulness (anger or stress), walking (restlessness), loving-kindness (harsh self-talk), movement (restless energy). Otherwise null. Never suggest a practice for a crisis message.
- offer_talk: true when the person seems alone, says you are all they have, or could clearly use a human supporter.
- memory_candidate: only when the person explicitly asks you to remember something; rephrase it from their perspective ("my goal..." becomes "Your goal..."). Otherwise null.`;

const REPLY_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
    practice_id: { type: ["string", "null"], enum: [...BUDDY_PRACTICE_IDS, null] },
    offer_talk: { type: "boolean" },
    crisis: { type: "boolean" },
    memory_candidate: { type: ["string", "null"] },
  },
  required: ["text", "practice_id", "offer_talk", "crisis", "memory_candidate"],
  additionalProperties: false,
} as const;

export type BuddyAiInput = {
  message: string;
  history: { role: "user" | "buddy"; text: string }[];
  memories: string[];
  memoryOn: boolean;
};
export type BuddyAiResult = { ok: true; reply: BuddyAiReply } | { ok: false; error: string };

const FAIL = "AI Buddy isn't available right now. Practice replies still work.";

export async function askBuddyReply(data: BuddyAiInput): Promise<BuddyAiResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { ok: false, error: FAIL };

  let instructions = `${BASE_RULES}\n${FIELDS}`;
  if (data.memoryOn && data.memories.length > 0) {
    instructions += `\n\nNotes the person chose to save on their own device (use naturally; never recite them or reveal they are stored unless asked):\n${data.memories.map((m) => `- ${m}`).join("\n")}`;
  }

  const messages = [
    ...data.history.slice(-8).map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text })),
    { role: "user", content: data.message },
  ];

  try {
    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        "Lovable-API-Key": key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: messages,
        reasoning: { effort: "low" },
        store: false,
        stream: true,
        text: { format: { type: "json_schema", name: "buddy_reply", strict: true, schema: REPLY_SCHEMA } },
      }),
    });

    if (!res.ok || !res.body) {
      let error = FAIL;
      if (res.status === 429) error = "AI Buddy is busy right now. Please try again in a moment.";
      else if (res.status === 402) {
        try {
          const body = (await res.json()) as { message?: string };
          if (body?.message) error = body.message;
        } catch {
          /* keep default message */
        }
      }
      return { ok: false, error };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let rawOut = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) rawOut += ev.delta;
        } catch {
          /* ignore partial SSE frames */
        }
      }
    }

    const reply = parseBuddyReply(rawOut);
    if (!reply) return { ok: false, error: FAIL };
    // Honor the memory setting: with memory off, nothing is offered for saving.
    if (!data.memoryOn) delete reply.memoryCandidate;
    return { ok: true, reply };
  } catch {
    return { ok: false, error: FAIL };
  }
}
