import { useLocal } from "@/lib/store";

/**
 * AI Buddy — device-only storage + a scripted (mock) responder.
 * The mock is used until a real AI service is connected. It is clearly
 * labeled in the UI as "Practice mode" and never presented as live AI.
 */

export type BuddyMsg = {
  id: string;
  role: "user" | "buddy";
  text: string;
  practiceId?: string;
  offerTalk?: boolean;
  crisis?: boolean;
  memoryCandidate?: string;
};
export type Conversation = { id: string; title: string; updatedAt: string; messages: BuddyMsg[] };
export type Memory = { id: string; text: string; date: string };
export type BuddySettings = {
  enabled: boolean;
  memory: boolean; // off by default
  history: boolean; // save conversations on this device
  voiceReplies: boolean; // auto-read replies aloud
  voiceConsent: boolean; // agreed to browser speech recognition
};

export const BUDDY_KEYS = {
  settings: "bb.buddy.settings",
  memories: "bb.buddy.memories",
  conversations: "bb.buddy.conversations",
} as const;

export const BUDDY_DEFAULTS: BuddySettings = { enabled: true, memory: false, history: true, voiceReplies: false, voiceConsent: false };

export const useBuddySettings = () => useLocal<BuddySettings>(BUDDY_KEYS.settings, BUDDY_DEFAULTS);
export const useMemories = () => useLocal<Memory[]>(BUDDY_KEYS.memories, []);
export const useConversations = () => useLocal<Conversation[]>(BUDDY_KEYS.conversations, []);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const WELCOME =
  "Hi, I'm your AI Buddy. You can talk about what's on your mind, or we can just take a quiet moment together. What would you like to share?";
export const QUICK_STARTS = ["I want to talk", "I'm having a hard day", "Let's just chat"] as const;
export const MAX_LEN = 1000;

export function clearBuddyData() {
  Object.values(BUDDY_KEYS).forEach((k) => {
    window.localStorage.removeItem(k);
    window.dispatchEvent(new CustomEvent("bb-store", { detail: k }));
  });
}

const has = (t: string, words: string[]) => words.some((w) => t.includes(w));

const CRISIS = [
  "kill myself", "suicide", "end my life", "want to die", "hurt myself", "self harm", "self-harm",
  "no reason to live", "better off dead", "kill someone", "hurt someone", "hurt them", "in danger",
];

/** Pull a memory candidate from "remember that ..." style requests. */
export function memoryCandidate(text: string): string | undefined {
  const m = text.match(/remember (?:that )?(.+)/i);
  if (!m) return undefined;
  let s = (m[1] ?? "").trim().replace(/[.!]+$/, "");
  s = s.replace(/^my /i, "Your ").replace(/^i /i, "You ").replace(/\bI'm\b/g, "you're").replace(/\bI am\b/g, "you are");
  s = s.replace(/\bmy\b/gi, "your").replace(/\bI\b/g, "you");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Scripted, rule-based replies for practice mode. Pure — easy to test. */
export function mockReply(input: string, opts: { memoryOn: boolean; turn: number }): Omit<BuddyMsg, "id" | "role"> {
  const t = input.toLowerCase().trim();

  if (has(t, CRISIS)) {
    return {
      crisis: true,
      offerTalk: true,
      text:
        "I'm really glad you told me. You deserve support from a real person right now. In the U.S., you can call or text 988 any time, or call 911 if you're in immediate danger. I can't contact anyone for you — would you be willing to reach out to one of them?",
    };
  }

  const cand = memoryCandidate(input);
  if (cand) {
    return opts.memoryOn
      ? { memoryCandidate: cand, text: "That sounds important. Would you like me to remember it for next time?" }
      : { text: "That sounds important. Memory is off right now, so I won't save it — you can turn it on in What AI Buddy Remembers." };
  }

  if (has(t, ["you're all i need", "only one who understands", "don't need anyone", "you're my only"])) {
    return {
      offerTalk: true,
      text: "I'm glad talking helps. I'm an AI, though, and you deserve people in your corner too. Is there someone you trust you could reach out to this week?",
    };
  }
  if (has(t, ["are you human", "are you real", "are you a therapist", "are you a person"])) {
    return { text: "I'm an AI companion, not a person or a therapist. I'm here to listen, and I can point you to real people when you want that." };
  }
  if (has(t, ["calm", "relax", "breathe", "overwhelm", "stressed", "anxious", "panic"])) {
    return { practiceId: "grounding", text: "That sounds like a lot to carry right now. Would you like to talk about it, or try a short grounding practice?" };
  }
  if (has(t, ["angry", "mad", "furious", "pissed"])) {
    return { practiceId: "mindfulness", text: "Anger makes sense when things feel unfair. Do you want to tell me what set it off?" };
  }
  if (has(t, ["can't sleep", "cant sleep", "insomnia", "awake"])) {
    return { practiceId: "body-scan", text: "Nights can feel long when your mind won't settle. Want to talk, or try a slow body scan?" };
  }
  if (has(t, ["lonely", "alone", "no one", "nobody cares"])) {
    return { offerTalk: true, text: "Feeling alone is hard. I'm glad you said something. Is there anyone — even one person — you've felt okay talking to before?" };
  }
  if (has(t, ["reject", "hire", "job", "interview", "work"])) {
    return t.includes("three") || t.includes("again") || t.includes("keep")
      ? { text: "That much rejection can feel exhausting. Would you rather talk about it for a bit, or think through what might help tomorrow?" }
      : { text: "That sounds really discouraging, especially when you're putting yourself out there. Do you want to tell me what happened?" };
  }
  if (has(t, ["hard day", "bad day", "terrible", "rough", "awful"])) {
    return { text: "I'm sorry today has been hard. I'm here. What's been weighing on you the most?" };
  }
  if (t === "i want to talk") return { text: "I'm listening. Take your time — what's on your mind?" };
  if (t === "let's just chat" || t === "lets just chat") return { text: "Sounds good. What's something small that went okay today, or something you're into lately?" };
  if (has(t, ["thank", "thanks"])) return { text: "You're welcome. I'm glad you took a moment for yourself." };
  if (has(t, ["family", "kids", "mom", "dad", "brother", "sister"])) {
    return { text: "Family can bring up a lot. What feels most important to you about them right now?" };
  }
  const fallbacks = [
    "I hear you. Can you tell me a little more?",
    "That makes sense. How are you feeling about it right now?",
    "Thanks for sharing that with me. What would feel helpful right now — talking more, or a quiet moment?",
  ];
  return { text: fallbacks[opts.turn % fallbacks.length] ?? fallbacks[0]! };
}
