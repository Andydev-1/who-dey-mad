export const ROUND_TYPES = {
  normal: {
    id: "normal",
    label: "SCENARIO",
    kicker: "THE USUAL WAHALA",
    seconds: 20,
  },
  hotseat: {
    id: "hotseat",
    label: "HOT SEAT",
    kicker: "NO TIME TO OVERTHINK",
    seconds: 10,
  },
  plotTwist: {
    id: "plotTwist",
    label: "PLOT TWIST",
    kicker: "SOMETHING JUST HAPPENED",
    seconds: 18,
    twistSeconds: 12,
  },
  unpopular: {
    id: "unpopular",
    label: "UNPOPULAR OPINION",
    kicker: "READ THE ROOM",
    seconds: 18,
    predictSeconds: 12,
  },
  bonus: {
    id: "bonus",
    label: "BONUS ROUND",
    kicker: "EXTRA XP DEY HERE",
    seconds: 16,
  },
  finale: {
    id: "finale",
    label: "FINAL ROUND",
    kicker: "ONE LAST DECISION",
    seconds: 24,
  },
};

export const SOLO_FLOW = [
  "normal",
  "hotseat",
  "normal",
  "plotTwist",
  "unpopular",
  "bonus",
  "normal",
  "finale",
];

export const ROUND_SIZE = SOLO_FLOW.length;
