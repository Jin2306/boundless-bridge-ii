import { describe, expect, it } from "vitest";
import { mockReply, memoryCandidate, BUDDY_DEFAULTS } from "@/lib/buddy";

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
