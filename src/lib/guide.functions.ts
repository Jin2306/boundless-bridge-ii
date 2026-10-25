import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PRACTICE_IDS = ["grounding", "ten-breaths", "walking", "body-scan", "loving-kindness", "mindfulness", "movement"];

const BASE = `You are "Practice Guide" in Boundless Bridge, a prototype mindfulness app (not an official Boundless Freedom Project service).
Rules: You are not a therapist, counselor, lawyer, or BFP employee. Never diagnose, give legal/medical/treatment advice, or invent BFP services, meeting times, or local organizations. Never encourage reliance on you; point toward real people. If someone mentions danger or crisis, tell them to call 911 for immediate danger or call/text 988.
Available practices (ids): grounding, ten-breaths, walking, body-scan, loving-kindness, mindfulness, movement.
End your reply with a final line exactly like: PRACTICE: <id>`;

const PARTICIPANT = `${BASE}
The user is a person using mindfulness during life transitions. Reply in 1–2 short, plain sentences (under 40 words). Warm and simple. No follow-up questions.`;
const SUPPORTER = `${BASE}
The user is a family member or supporter. Give practical, respectful guidance in 3–5 sentences: listening without judgment, asking before advising, respecting autonomy, offering a practice together. Never suggest monitoring or tracking the person.`;

const FAIL = { ok: false as const, error: "The guide isn't available right now. Your practices still work." };

export const askGuide = createServerFn({ method: "POST" })
  .inputValidator(z.object({ role: z.enum(["participant", "supporter"]), message: z.string().min(1).max(800) }))
  .handler(async ({ data }) => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return FAIL;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Lovable-API-Key": key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: data.role === "participant" ? PARTICIPANT : SUPPORTER,
          input: [{ role: "user", content: data.message }],
          reasoning: { effort: "low" },
          store: false,
          stream: true,
        }),
      });
      if (!res.ok || !res.body) {
        return res.status === 429 ? { ok: false as const, error: "The guide is busy. Please try again shortly." } : FAIL;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let raw = "";
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
            if (ev.type === "response.output_text.delta" && ev.delta) raw += ev.delta;
          } catch {
            /* ignore partial */
          }
        }
      }
      if (!raw.trim()) return FAIL;
      const m = raw.match(/PRACTICE:\s*([a-z-]+)/i);
      const found = m?.[1]?.toLowerCase();
      const practice = found && PRACTICE_IDS.includes(found) ? found : "grounding";
      return { ok: true as const, text: raw.replace(/PRACTICE:.*$/im, "").trim(), practice };
    } catch {
      return FAIL;
    }
  });
