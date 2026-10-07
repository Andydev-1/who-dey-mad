export const PERSONALITIES = [
  {
    id: "shifter",
    name: "THE PROFESSIONAL SHIFTER",
    emoji: "🥷",
    tagline: "Wahala avoidance is a career.",
    description:
      "You have mastered the Nigerian art of avoiding unnecessary wahala. Somehow, you always find a way — a small shift, a small smile, a small “no vex.” People think you’re lucky. You’re just trained.",
    color: "#3DDC84",
  },
  {
    id: "jeje",
    name: "THE OMO IYA JEJE",
    emoji: "🕊️",
    tagline: "Peace of mind is the real flex.",
    description:
      "You don’t like noise, you don’t like drama, and you will leave a danfo if the vibe is wrong. Soft life looks expensive on you, but it’s actually self-preservation. Your mum would be proud. Your friends call you careful.",
    color: "#A7F3D0",
  },
  {
    id: "negotiator",
    name: "THE STREET NEGOTIATOR",
    emoji: "🤝",
    tagline: "Everything is a conversation.",
    description:
      "Price is never the price. Time is never the time. You can turn “impossible” into “make we talk.” Market women respect you. Uber drivers fear your “my guy.” Nigeria is a marketplace and you brought a strategy.",
    color: "#FBBF24",
  },
  {
    id: "bigboy",
    name: "THE BIG BOY",
    emoji: "🥂",
    tagline: "If you’re not spraying, are you even there?",
    description:
      "You believe life should look like the highlight reel. Owambe, aso-ebi, “God has done it,” then a quiet panic on the 28th. Charming, generous, slightly dangerous to a savings account. The DJ knows your name.",
    color: "#F472B6",
  },
  {
    id: "diplomat",
    name: "THE FAMILY DIPLOMAT",
    emoji: "🎩",
    tagline: "You can cool a WhatsApp group with one sticker.",
    description:
      "Aunties ask questions. Uncles forward medical miracles. You serve food, redirect missiles, and keep Christmas from becoming a tribunal. People underestimate how much peace you manufacture.",
    color: "#60A5FA",
  },
  {
    id: "wahala",
    name: "THE WAHALA MAGNET",
    emoji: "⚡",
    tagline: "If it’s quiet, you’ll find the aux cord.",
    description:
      "You don’t start trouble. Trouble just enjoys your company. You’ll ask “shift go where?” You’ll start your gen at 1am. The group chat is never boring when you’re online. Nigeria noticed you immediately.",
    color: "#FB7185",
  },
  {
    id: "lastminute",
    name: "THE LAST-MINUTE LEGEND",
    emoji: "⏰",
    tagline: "Deadline is a love language.",
    description:
      "You function best when the timer is red and the slides are wrong. Somehow it still works — or it becomes a story. You treat planning like optional DLC. When it pays off, you look like a genius. When it doesn’t, you still have jokes.",
    color: "#F59E0B",
  },
  {
    id: "survivor",
    name: "THE SURVIVOR",
    emoji: "🛡️",
    tagline: "NEPA, traffic, alert — you still showed up.",
    description:
      "You have seen things. Inner roads. 11% battery. Last week of the month. You don’t panic; you plug everything and keep moving. Lagos Survival is not a stat for you. It’s a lifestyle.",
    color: "#34D399",
  },
  {
    id: "savage",
    name: "THE SAVAGE CHAIRMAN",
    emoji: "🧊",
    tagline: "“Noted.” was invented for you.",
    description:
      "You don’t shout. You don’t beg. You send one word and the group creates a subcommittee. People say you’re doing too much. You ask how they dey see you. Soft? Never. Fair? Sometimes. Unforgettable? Always.",
    color: "#C4B5FD",
  },
];

export function pickPersonality(stats) {
  const scores = {
    shifter: stats.patience * 1.2 + stats.lagos * 0.8 + stats.streetIq * 0.6 - stats.wahala * 0.9,
    jeje: stats.patience * 1.4 - stats.savage * 0.8 - stats.wahala * 0.8 + stats.financial * 0.3,
    negotiator: stats.negotiation * 1.6 + stats.streetIq * 0.8 + stats.financial * 0.5,
    bigboy: stats.social * 1.2 - stats.financial * 0.7 + stats.savage * 0.3,
    diplomat: stats.social * 1.1 + stats.patience * 1.1 + stats.negotiation * 0.6 - stats.wahala * 0.5,
    wahala: stats.wahala * 1.5 + stats.savage * 0.9 + stats.social * 0.3,
    lastminute: (100 - stats.patience) * 0.8 + stats.streetIq * 0.6 + stats.wahala * 0.4,
    survivor: stats.lagos * 1.3 + stats.streetIq * 1.0 + stats.financial * 0.6,
    savage: stats.savage * 1.6 + stats.social * 0.4 + stats.wahala * 0.3,
  };

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return PERSONALITIES.find((p) => p.id === winner) ?? PERSONALITIES[0];
}
