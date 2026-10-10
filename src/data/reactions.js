function toneFromStats(stats = {}) {
  const entries = Object.entries(stats);
  if (!entries.length) return "street";
  const [key] = entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
  if (key === "savage") return "savage";
  if (key === "negotiation") return "negotiator";
  if (key === "patience" && (stats.patience || 0) > 0) return "cautious";
  if (key === "financial") return "financial";
  if (key === "social") return "social";
  if (key === "wahala") return "chaos";
  if (key === "lagos") return "lagos";
  return "street";
}

const POOLS = {
  timeout: [
    "Timer finished you. Even NEPA gives more notice.",
    "You froze. The danfo left you at the bus stop of indecision.",
    "Silence is also an answer. A weak one, but an answer.",
    "Omo, the clock no dey wait for manifesto.",
  ],
  streak: [
    "Streak dey hot. Your village people weren't ready for this one.",
    "Back to back. You dey play like salary just entered.",
    "This one is becoming a habit. Dangerous, but entertaining.",
    "Keep going. The group chat will hear of this.",
  ],
  savage: [
    "Omo, you get mind sha! 😂",
    "Na you sabi. We no go argue.",
    "This decision needs to be investigated.",
    "Ice. The group will discuss you in another chat.",
    "How you dey see them? Because they have seen you.",
  ],
  cautious: [
    "Peacekeeper energy. You just donated your hip to Nigeria.",
    "Soft life detected. We will not fight you.",
    "You chose rest. The wahala will email you later.",
    "Careful. Sometimes that's the real flex.",
  ],
  negotiator: [
    "You understood the assignment. Nigeria is a marketplace.",
    "Make we talk. You just opened a senate hearing.",
    "Negotiation activated. Somebody's price just moved.",
    "Chairman of “my guy.” The fare felt that.",
  ],
  financial: [
    "Salary never enter, you don start spending am.",
    "Account balance coughed. You still showed up.",
    "Financial sense detected. The group chat will not understand you.",
    "Two-account theology. Very wise, slightly shady.",
  ],
  social: [
    "The algorithm ate well. Content over common sense.",
    "Main character lighting. The photographer found you.",
    "You brought personality. The room noticed.",
    "Public opinion is now a seasoning.",
  ],
  chaos: [
    "If we suffer, we suffer equally. Noted.",
    "You did not start trouble. Trouble just sat beside you.",
    "The aux cord found your hand. Inevitable.",
    "This is how legends and complaints are born.",
  ],
  lagos: [
    "Lagos survival unlocked. Inner road, outer trauma.",
    "You treated traffic like a spiritual assignment.",
    "This city will not finish you. Not today.",
    "Danfo, NEPA, and faith — your three app icons.",
  ],
  street: [
    "Street IQ applied. We saw the calculation.",
    "You played it like somebody that has paid bus fare before.",
    "Corrective lens applied. Respectfully chaotic.",
    "This is not theory. This is field work.",
  ],
  hotseat: [
    "Hot seat! You answered before your spirit could object.",
    "Fast. Reckless. Very Nigerian of you.",
    "No committee, no memo. Just vibes and a choice.",
  ],
  bonus: [
    "Bonus round. The extra points felt that energy.",
    "You came for the extra plate. We respect it.",
    "This one is for the scoreboard, not the aunties.",
  ],
  finale: [
    "Final round energy. Make it count like last fuel.",
    "One last decision. The ancestors leaned in.",
    "Credits are about to roll. You still chose chaos.",
  ],
  twist: [
    "Plot twist! Nigeria said “you thought it was finished.”",
    "The complication arrived like a conductor: uninvited and loud.",
    "Something just happened. Of course it did.",
  ],
  predictHit: [
    "You read the room. The crowd is predictable and you knew.",
    "Most popular? You called it. Street pollster.",
    "You predicted the nation. Slightly scary, very useful.",
  ],
  predictMiss: [
    "The crowd went another way. You remain special.",
    "Unpopular, but that's still a personality.",
    "You and the majority are not on speaking terms. Valid.",
  ],
};

function pickFrom(list, history) {
  const unused = list.filter((line) => !history.includes(line));
  const pool = unused.length ? unused : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickReaction(context, history = []) {
  const {
    timedOut,
    streak,
    quick,
    playType,
    beat,
    option,
    predictionHit,
  } = context;

  if (timedOut) return pickFrom(POOLS.timeout, history);

  if (beat === "predict") {
    return pickFrom(predictionHit ? POOLS.predictHit : POOLS.predictMiss, history);
  }

  if (beat === "twist") return pickFrom(POOLS.twist, history);

  if (streak >= 3 && quick) return pickFrom(POOLS.streak, history);
  if (playType === "hotseat") return pickFrom(POOLS.hotseat, history);
  if (playType === "bonus") return pickFrom(POOLS.bonus, history);
  if (playType === "finale") return pickFrom(POOLS.finale, history);

  const tone = toneFromStats(option?.stats);
  if (option?.reaction && Math.random() > 0.45) {
    if (!history.includes(option.reaction)) return option.reaction;
  }
  return pickFrom(POOLS[tone] || POOLS.street, history);
}
