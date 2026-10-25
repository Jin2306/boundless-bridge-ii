import { createFileRoute } from "@tanstack/react-router";
import { mockReply } from "@/lib/buddy";

/**
 * Phone line for people without a smartphone: Twilio calls this webhook,
 * we answer with TwiML (speak + listen). Every request must carry a valid
 * X-Twilio-Signature (HMAC-SHA1 with TWILIO_AUTH_TOKEN). Nothing is stored.
 */

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

const twiml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { "Content-Type": "text/xml" },
  });

const listen = (say: string, action: string) =>
  `<Gather input="speech" speechTimeout="auto" action="${esc(action)}" method="POST"><Say voice="Polly.Joanna">${esc(say)}</Say></Gather>` +
  `<Say voice="Polly.Joanna">I didn't hear anything. You can call back any time. Take care.</Say>`;

async function validSignature(request: Request, params: URLSearchParams): Promise<boolean> {
  const token = process.env["TWILIO_AUTH_TOKEN"];
  const sig = request.headers.get("X-Twilio-Signature");
  if (!token || !sig) return false;
  const keys = [...new Set(params.keys())].sort();
  const data = request.url + keys.map((k) => k + params.getAll(k).join("")).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  const expected = btoa(String.fromCharCode(...mac));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/voice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const params = new URLSearchParams(await request.text());
        if (!(await validSignature(request, params))) return new Response("Forbidden", { status: 403 });

        const action = new URL(request.url).pathname;
        const speech = (params.get("SpeechResult") ?? "").trim().slice(0, 1000);

        if (!speech) {
          return twiml(listen(
            "Hi, this is AI Buddy from Boundless Bridge. I'm an AI companion, not a person or a therapist. If you are in crisis, hang up and call or text 9 8 8. What's on your mind?",
            action,
          ));
        }
        if (/\b(goodbye|bye|hang up|that's all)\b/i.test(speech)) {
          return twiml(`<Say voice="Polly.Joanna">Thanks for calling. Take care of yourself.</Say><Hangup/>`);
        }

        // Crisis stays rule-based and always wins.
        const scripted = mockReply(speech, { memoryOn: false, turn: 0 });
        if (scripted.crisis) {
          return twiml(`<Say voice="Polly.Joanna">${esc(scripted.text)} I'll end this call now so you can reach them. Please call or text 9 8 8.</Say><Hangup/>`);
        }

        let text = scripted.text;
        try {
          const { askBuddyReply } = await import("@/lib/buddy.server");
          const res = await askBuddyReply({ message: speech, history: [], memories: [], memoryOn: false });
          if (res.ok) text = res.reply.crisis ? res.reply.text : res.reply.text;
          if (res.ok && res.reply.crisis) return twiml(`<Say voice="Polly.Joanna">${esc(text)}</Say><Hangup/>`);
        } catch {
          /* keep scripted reply */
        }
        return twiml(listen(text, action));
      },
    },
  },
});
