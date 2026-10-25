import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({ role: z.enum(["user", "buddy"]), text: z.string().max(1000) })).max(8).default([]),
  memories: z.array(z.string().max(300)).max(10).default([]),
  memoryOn: z.boolean().default(false),
});

/**
 * Live AI Buddy replies through the Lovable AI gateway. The server-only
 * gateway module is loaded inside the handler so it never enters the client
 * graph. Returns ok:false with a safe, user-facing error on failure — the
 * UI then falls back to the scripted practice reply.
 */
export const askBuddy = createServerFn({ method: "POST" })
  .inputValidator(inputSchema.parse)
  .handler(async ({ data }) => {
    const { askBuddyReply } = await import("./buddy.server");
    return askBuddyReply(data);
  });
