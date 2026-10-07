export const DAILY_CHALLENGE = {
  id: "daily-month-end",
  title: "TODAY'S CHALLENGE",
  kicker: "Last week energy.",
  prompt:
    "It's the last week of the month and you have ₦3,000 left.\nWhat are you doing?",
  options: [
    { key: "A", text: "Indomie + sachet water. We dey manage." },
    { key: "B", text: "Call the person that “got paid already.”" },
    { key: "C", text: "Still bounce. Life is for living." },
    { key: "D", text: "Transfer it to savings and pretend you are rich in character." },
  ],
  results: {
    A: 18,
    B: 42,
    C: 27,
    D: 13,
  },
  reactions: {
    A: "Respect. The packets will carry you to salary week.",
    B: "A national economic policy. Soft loan with extra gist.",
    C: "Main character till Monday. Then the testimony changes.",
    D: "Financial sense detected. The group chat will not understand you.",
  },
};
