import { describe, expect, it } from "vitest";
import { recommend, PRACTICES, BFP } from "@/lib/practices";

describe("recommendations", () => {
  it("stressed → grounding", () => expect(recommend("stressed")).toBe("grounding"));
  it("angry → mindfulness", () => expect(recommend("angry")).toBe("mindfulness"));
  it("worried → ten breaths", () => expect(recommend("worried")).toBe("ten-breaths"));
  it("lonely → loving-kindness", () => expect(recommend("lonely")).toBe("loving-kindness"));
  it("can't sleep → body scan", () => expect(recommend("sleep")).toBe("body-scan"));
  it("skip → grounding", () => expect(recommend(null)).toBe("grounding"));
  it("has seven core practices", () => expect(PRACTICES).toHaveLength(7));
  it("BFP phone link", () => expect(BFP.tel).toBe("tel:+19167474294"));
});
