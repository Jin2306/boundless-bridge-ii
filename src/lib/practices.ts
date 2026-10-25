export type Practice = {
  id: string;
  title: string;
  minutes: number;
  source: string;
  summary: string;
  steps: string[];
  together?: boolean;
};

const SRC = "Boundless Freedom Project, Buddhist Pathways Packet";

export const PRACTICES: Practice[] = [
  {
    id: "grounding",
    title: "Grounding Through the Senses",
    minutes: 2,
    source: `${SRC}, pp. 30–31`,
    summary: "Come back to the present through what you feel, hear, and see.",
    steps: [
      "Find a comfortable way to sit or stand.",
      "Notice your feet touching the floor.",
      "Notice your body supported by the chair or the ground.",
      "Notice the feeling of your clothes on your skin.",
      "Listen to the sounds around you. Near, then far.",
      "Notice what you can see. Let your eyes rest on one thing.",
      "Take a comfortable breath.",
    ],
  },
  {
    id: "ten-breaths",
    title: "Ten Mindful Breaths",
    minutes: 2,
    source: `${SRC}, p. 30`,
    summary: "Count ten comfortable breaths. No special rhythm needed.",
    steps: [
      "Let your breath be natural. There is no right way to breathe.",
      "Notice one breath in, and one breath out. That is one.",
      "Keep counting, at your own pace, up to five.",
      "If your mind wanders, that's okay. Gently start again.",
      "Continue counting up to ten.",
      "When you reach ten, rest for a moment.",
    ],
  },
  {
    id: "walking",
    title: "Walking Meditation",
    minutes: 5,
    source: `${SRC}, p. 32`,
    summary: "Feel each step. You can also do this sitting down.",
    steps: [
      "Stand still for a moment. Or sit, if that feels better.",
      "Feel the weight of your body in your feet.",
      "Slowly lift one foot. Notice lifting, moving, placing.",
      "Seated option: slowly lift and lower your heels instead.",
      "Take a few slow steps. Notice each one.",
      "When your mind wanders, return to the feeling in your feet.",
      "Pause. Stand or sit still, and notice how you feel.",
    ],
  },
  {
    id: "body-scan",
    title: "Body Scan",
    minutes: 5,
    source: `${SRC}, p. 34`,
    summary: "Move your attention gently from your feet to your head.",
    steps: [
      "Get comfortable. You can close your eyes if you like.",
      "Bring attention to your feet. Just notice.",
      "Move up to your legs and knees.",
      "Notice your belly and back.",
      "Notice your hands, arms, and shoulders.",
      "Notice your neck, face, and the top of your head.",
      "Rest with your whole body for a few breaths.",
    ],
  },
  {
    id: "loving-kindness",
    title: "Loving-Kindness Meditation",
    minutes: 5,
    source: `${SRC}, p. 36`,
    summary: "Offer kind wishes to yourself and others.",
    steps: [
      "Sit comfortably and take a gentle breath.",
      "Say quietly to yourself: May I be happy.",
      "May I be healthy.",
      "May I be safe.",
      "May I live with ease.",
      "Think of someone you care about. May you be happy, healthy, safe, and live with ease.",
      "Let these wishes spread to all beings, everywhere.",
    ],
  },
  {
    id: "mindfulness",
    title: "Mindfulness Meditation",
    minutes: 3,
    source: `${SRC}, pp. 34–35`,
    summary: "Rest in the present moment, just as it is.",
    steps: [
      "Sit comfortably. Let your hands rest.",
      "Notice what is happening right now.",
      "Notice thoughts as they come and go, like clouds.",
      "Notice any feelings, without needing to change them.",
      "If you feel strong emotion, notice it, and name it kindly.",
      "Return to your breath whenever you need an anchor.",
    ],
  },
  {
    id: "movement",
    title: "Mindful Movement",
    minutes: 3,
    source: `${SRC}, p. 29`,
    summary: "Gentle movements. Only do what feels okay for your body.",
    steps: [
      "Sit or stand. Move only in ways that feel comfortable.",
      "Slowly roll your shoulders back a few times.",
      "Gently turn your head left, then right.",
      "Stretch your arms up, or forward, then let them rest.",
      "Open and close your hands slowly.",
      "Be still. Notice how your body feels now.",
    ],
  },
];

export const TOGETHER: Practice[] = [
  {
    id: "t-grounding",
    title: "Two-Minute Grounding Together",
    minutes: 2,
    source: `Adapted from ${SRC}, pp. 30–31`,
    summary: "A short pause you can share on one phone.",
    together: true,
    steps: [
      "Find a comfortable place, together.",
      "Notice your feet touching the ground.",
      "Listen to the sounds around you.",
      "Take a comfortable breath.",
      "If you'd like, share one thing you noticed. It's okay to pass.",
    ],
  },
  {
    id: "t-loving-kindness",
    title: "Loving-Kindness Together",
    minutes: 4,
    source: `Adapted from ${SRC}, p. 36`,
    summary: "Offer kind wishes, side by side.",
    together: true,
    steps: [
      "Sit near each other, comfortably.",
      "Each of you, quietly: May I be happy. May I be healthy.",
      "May I be safe. May I live with ease.",
      "Now, for each other: May you be happy. May you be healthy.",
      "May you be safe. May you live with ease.",
      "Rest together for a breath or two. Nothing more is needed.",
    ],
  },
  {
    id: "t-walking",
    title: "Mindful Walking",
    minutes: 5,
    source: `Adapted from ${SRC}, p. 32`,
    summary: "Walk slowly, side by side, without needing to talk.",
    together: true,
    steps: [
      "Agree to walk slowly and quietly for a few minutes.",
      "Notice each step: lifting, moving, placing.",
      "Notice the air, the sounds, the ground.",
      "Seated option: slowly lift and lower your heels together.",
      "Stop. Stand still together for one breath.",
      "If you'd like, share one word about how you feel. Passing is fine.",
    ],
  },
  {
    id: "t-quiet",
    title: "Five-Minute Quiet Moment",
    minutes: 5,
    source: `Adapted from ${SRC}, pp. 34–35`,
    summary: "Simply sit together in calm.",
    together: true,
    steps: [
      "Sit comfortably. Put phones face down after starting.",
      "Let your breathing be natural.",
      "Notice what you hear and feel, without talking.",
      "When thoughts come, let them pass.",
      "Gently bring your attention back to the room.",
    ],
  },
  {
    id: "t-gratitude",
    title: "Gratitude Reflection",
    minutes: 3,
    source: "Boundless Bridge shared activity",
    summary: "Each person names something they appreciate.",
    together: true,
    steps: [
      "Take one comfortable breath together.",
      "Think of one small thing that went okay today.",
      "If you'd like, share it. Listening is enough too.",
      "Think of one person or thing you're grateful for.",
      "Thank each other for taking this moment.",
    ],
  },
];

export const ALL_PRACTICES = [...PRACTICES, ...TOGETHER];
export const getPractice = (id: string) => ALL_PRACTICES.find((p) => p.id === id);

export const FEELINGS = [
  { id: "stressed", label: "I'm feeling stressed", practice: "grounding" },
  { id: "angry", label: "I'm feeling angry", practice: "mindfulness" },
  { id: "worried", label: "I'm feeling worried", practice: "ten-breaths" },
  { id: "lonely", label: "I'm feeling lonely", practice: "loving-kindness" },
  { id: "sleep", label: "I can't sleep", practice: "body-scan" },
  { id: "moment", label: "I just need a moment", practice: "grounding" },
] as const;

export function recommend(feelingId: string | null): string {
  return FEELINGS.find((f) => f.id === feelingId)?.practice ?? "grounding";
}

export const BFP = {
  website: "https://boundlessfreedom.org",
  email: "info@boundlessfreedom.org",
  phone: "(916) 747-4294",
  tel: "tel:+19167474294",
  sanghaMail:
    "mailto:info@boundlessfreedom.org?subject=" +
    encodeURIComponent("How can I join the Online Sangha?") +
    "&body=" +
    encodeURIComponent("Hello,\n\nI'd like to learn how to join the weekly Online Sangha. Could you share how to take part?\n\nThank you."),
};
