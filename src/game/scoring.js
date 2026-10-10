export function scoreAnswer({
  timedOut = false,
  remaining = 0,
  duration = 20,
  streak = 0,
  playType = "normal",
  predictionHit = false,
  beat = "question",
} = {}) {
  if (timedOut) {
    return {
      xp: beat === "predict" ? 6 : 8,
      breakdown: {
        base: beat === "predict" ? 6 : 8,
        speed: 0,
        streak: 0,
        prediction: 0,
        bonus: 0,
      },
      nextStreak: 0,
      quick: false,
    };
  }

  const quick = remaining >= Math.ceil(duration * 0.55);
  const nextStreak = quick ? streak + 1 : 0;

  const base = playType === "finale" ? 36 : playType === "bonus" ? 30 : 24;
  const speedRate = playType === "hotseat" ? 2.4 : 1.3;
  const speed = Math.round(remaining * speedRate);
  const streakXp = nextStreak >= 2 ? Math.min(nextStreak, 5) * 8 : 0;
  const prediction = predictionHit ? 45 : 0;
  const bonus = playType === "bonus" ? 22 : playType === "finale" ? 28 : 0;
  const twist = beat === "twist" ? 16 : 0;

  const xp = base + speed + streakXp + prediction + bonus + twist;

  return {
    xp,
    breakdown: { base, speed, streak: streakXp, prediction, bonus: bonus + twist },
    nextStreak,
    quick,
  };
}
