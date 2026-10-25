import { describe, expect, it } from "vitest";
import { mockReply, memoryCandidate, parseBuddyReply, BUDDY_DEFAULTS } from "@/lib/buddy";

describe("AI Buddy rules", () => {
  it("memory is off by default", () => expect(BUDDY_DEFAULTS.memory).toBe(false));
  it("crisis messages point to 988 and real people", () => {
    const r = mockReply("I want to end my life", { memoryOn: false, turn: 1 });
    expect(r.crisis).toBe(true);
    expect(r.text).toContain("988");
    expect(r.offerTalk).toBe(true);
  });
  it("asks before remembering when memory is on", () => {
    const r = mockReply("Remember that my goal is to find a stable job", { memoryOn: true, turn: 1 });
    expect(r.memoryCandidate).toBe("Your goal is to find a stable job");
  });
  it("never offers to save when memory is off", () => {
    expect(mockReply("Remember that I like walking", { memoryOn: false, turn: 1 }).memoryCandidate).toBeUndefined();
  });
  it("calming request suggests the existing grounding practice", () =>
    expect(mockReply("Can we do something to help me feel calmer?", { memoryOn: false, turn: 1 }).practiceId).toBe("grounding"));
  it("does not claim to be human", () =>
    expect(mockReply("are you human?", { memoryOn: false, turn: 1 }).text).toContain("not a person"));
  it("parses remember phrasing", () => expect(memoryCandidate("hello")).toBeUndefined());
});

describe("live AI reply parsing", () => {
  const valid = { text: "I hear you.", practice_id: "grounding", offer_talk: false, crisis: false, memory_candidate: null };
  it("parses a valid model reply", () => {
    expect(parseBuddyReply(JSON.stringify(valid))).toEqual({
      text: "I hear you.", practiceId: "grounding", offerTalk: false, crisis: false, memoryCandidate: undefined,
    });
  });
  it("drops unknown practice ids", () => {
    const r = parseBuddyReply(JSON.stringify({ ...valid, practice_id: "made-up" }));
    expect(r?.practiceId).toBeUndefined();
  });
  it("never suggests a practice on a crisis reply", () => {
    const r = parseBuddyReply(JSON.stringify({ ...valid, crisis: true, text: "Please call 988." }));
    expect(r?.crisis).toBe(true);
    expect(r?.practiceId).toBeUndefined();
  });
  it("rejects empty, non-JSON, or textless output", () => {
    expect(parseBuddyReply("")).toBeNull();
    expect(parseBuddyReply("not json at all")).toBeNull();
    expect(parseBuddyReply(JSON.stringify({ ...valid, text: "  " }))).toBeNull();
  });
});
