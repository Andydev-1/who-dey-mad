export const RANKS = [
  {
    min: 0,
    id: "corper",
    name: "FRESH CORPER",
    emoji: "🎽",
    blurb: "Still tying the white-white. The wahala is loading.",
  },
  {
    min: 240,
    id: "street",
    name: "STREET SCHOLAR",
    emoji: "🧠",
    blurb: "You have seen a danfo. You did not perish. Respect.",
  },
  {
    min: 380,
    id: "captain",
    name: "WAHALA CAPTAIN",
    emoji: "⚡",
    blurb: "The group chat checks your score before the gist.",
  },
  {
    min: 520,
    id: "chairman",
    name: "CHAIRMAN OF CHAOS",
    emoji: "👑",
    blurb: "Village people have scheduled an emergency meeting.",
  },
];

export function rankForXp(xp) {
  const sorted = [...RANKS].sort((a, b) => b.min - a.min);
  return sorted.find((rank) => xp >= rank.min) ?? RANKS[0];
}
