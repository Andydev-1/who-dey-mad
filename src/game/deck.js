import { QUESTIONS } from "../data/questions";
import { ROUND_TYPES, SOLO_FLOW } from "../data/rounds";
import { hashCode, mulberry32, shuffle } from "./rng";

export function crowdMixFor(question) {
  if (question.crowdMix) return question.crowdMix;
  const keys = question.options.map((option) => option.key);
  const rng = mulberry32(hashCode(`${question.id}-crowd`));
  const weights = keys.map(() => 14 + Math.floor(rng() * 38));
  const sum = weights.reduce((total, value) => total + value, 0);
  const mix = {};
  keys.forEach((key, index) => {
    mix[key] = Math.round((weights[index] / sum) * 100);
  });
  const drift = 100 - Object.values(mix).reduce((total, value) => total + value, 0);
  mix[keys[0]] += drift;
  return mix;
}

export function popularKey(question) {
  const mix = crowdMixFor(question);
  return Object.entries(mix).sort((a, b) => b[1] - a[1])[0][0];
}

const FINALE_TAGS = [
  "Salary Day",
  "Nigerian Wedding",
  "Family Gathering",
  "NEPA",
  "Nigerian Parents",
  "Owambe",
];

export function buildDeck(seed) {
  const unused = shuffle(QUESTIONS, seed);
  const used = new Set();
  const deck = [];

  const take = (predicate) => {
    const found = unused.find((question) => !used.has(question.id) && predicate(question));
    if (found) {
      used.add(found.id);
      return found;
    }
    const fallback = unused.find((question) => !used.has(question.id));
    if (fallback) used.add(fallback.id);
    return fallback;
  };

  for (const type of SOLO_FLOW) {
    let pick;
    if (type === "plotTwist") {
      pick = take((question) => Boolean(question.twist));
    } else if (type === "finale") {
      pick = take((question) => FINALE_TAGS.includes(question.tag));
    } else {
      pick = take(() => true);
    }
    if (!pick) break;

    const playType = type === "plotTwist" && !pick.twist ? "normal" : type;
    const meta = ROUND_TYPES[playType];
    deck.push({
      ...pick,
      playType,
      seconds: meta.seconds,
      crowdMix: crowdMixFor(pick),
    });
  }

  return deck;
}

export function secondsForBeat(question, beat) {
  if (!question) return 20;
  const meta = ROUND_TYPES[question.playType] || ROUND_TYPES.normal;
  if (beat === "twist") return meta.twistSeconds || 12;
  if (beat === "predict") return meta.predictSeconds || 12;
  return question.seconds || meta.seconds;
}
