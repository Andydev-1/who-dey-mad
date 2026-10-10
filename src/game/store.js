import { computed, reactive } from "vue";
import { QUESTIONS, STAT_KEYS } from "../data/questions";
import { pickPersonality } from "../data/personalities";
import { pickReaction } from "../data/reactions";
import { rankForXp } from "../data/ranks";
import { ROUND_SIZE } from "../data/rounds";
import { buildDeck, popularKey, secondsForBeat } from "./deck";
import { hashCode } from "./rng";
import { scoreAnswer } from "./scoring";

export { ROUND_SIZE };
export const QUESTION_SECONDS = 20;

function emptyStats() {
  return STAT_KEYS.reduce((acc, key) => {
    acc[key] = 40;
    return acc;
  }, {});
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function generateChallengeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = new Uint32Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

function persistChallenge(code, payload) {
  const key = `wdm-challenge-${code}`;
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  current.push(payload);
  localStorage.setItem(key, JSON.stringify(current));
}

export function loadChallengeScores(code) {
  if (!code) return [];
  try {
    return JSON.parse(localStorage.getItem(`wdm-challenge-${code}`) || "[]");
  } catch {
    return [];
  }
}

export const game = reactive({
  mode: "solo",
  challengeCode: null,
  playerName: "You",
  deck: [],
  index: 0,
  stats: emptyStats(),
  score: 0,
  answers: [],
  phase: "idle",
  beat: "intro",
  lastReaction: null,
  lastPoints: 0,
  lastBreakdown: null,
  timedOut: false,
  personality: null,
  rank: null,
  highScore: false,
  shared: false,
  locked: false,
  streak: 0,
  bestStreak: 0,
  selectedKey: null,
  personalKey: null,
  predictedKey: null,
  predictionHit: false,
  continueTarget: "next",
  reactionHistory: [],
  roundXpLog: [],
});

export const currentQuestion = computed(() => game.deck[game.index] ?? null);

export const currentSeconds = computed(() =>
  secondsForBeat(currentQuestion.value, game.beat),
);

export const progress = computed(() => ({
  current: Math.min(game.index + 1, game.deck.length),
  total: game.deck.length || ROUND_SIZE,
}));

export const displayStats = computed(() => {
  const out = {};
  for (const key of STAT_KEYS) {
    out[key] = Math.round(clamp(game.stats[key]));
  }
  return out;
});

export const isLastRound = computed(
  () => game.index + 1 >= game.deck.length && game.deck.length > 0,
);

function applyStats(option) {
  if (!option?.stats) return;
  const nextStats = { ...game.stats };
  for (const [key, delta] of Object.entries(option.stats)) {
    nextStats[key] = clamp((nextStats[key] ?? 40) + delta);
  }
  game.stats = nextStats;
}

function rememberReaction(line) {
  game.lastReaction = line;
  game.reactionHistory = [...game.reactionHistory, line].slice(-8);
}

function freezeOption(question) {
  return {
    key: "X",
    text: "Froze",
    stats: { patience: -8, lagos: 4, wahala: 6 },
  };
}

export function startGame({
  mode = "solo",
  challengeCode = null,
  playerName = "You",
} = {}) {
  const seed = challengeCode
    ? hashCode(challengeCode)
    : Math.floor(Math.random() * 1e9);
  const deck = buildDeck(seed);

  game.mode = mode;
  game.challengeCode = challengeCode;
  game.playerName = playerName || "You";
  game.deck = deck;
  game.index = 0;
  game.stats = emptyStats();
  game.score = 0;
  game.answers = [];
  game.phase = "playing";
  game.beat = "intro";
  game.lastReaction = null;
  game.lastPoints = 0;
  game.lastBreakdown = null;
  game.timedOut = false;
  game.personality = null;
  game.rank = null;
  game.highScore = false;
  game.shared = false;
  game.locked = false;
  game.streak = 0;
  game.bestStreak = 0;
  game.selectedKey = null;
  game.personalKey = null;
  game.predictedKey = null;
  game.predictionHit = false;
  game.continueTarget = "next";
  game.reactionHistory = [];
  game.roundXpLog = [];
}

export function beginQuestion() {
  if (game.phase !== "playing") return;
  if (game.beat !== "intro") return;
  game.beat = "question";
  game.locked = false;
  game.timedOut = false;
  game.selectedKey = null;
  game.personalKey = null;
  game.predictedKey = null;
  game.predictionHit = false;
  game.continueTarget = "next";
  game.lastReaction = null;
}

export function applyAnswer(option, { timedOut = false, remaining = 0 } = {}) {
  if (game.locked) return;
  if (!["question", "twist", "predict"].includes(game.beat)) return;

  const question = currentQuestion.value;
  if (!question) return;

  game.locked = true;
  game.timedOut = timedOut;
  const duration = secondsForBeat(question, game.beat);
  const chosen = timedOut ? freezeOption(question) : option;
  if (!chosen) {
    game.locked = false;
    return;
  }

  game.selectedKey = chosen.key;

  if (game.beat === "question" && question.playType === "unpopular" && !timedOut) {
    applyStats(chosen);
    game.personalKey = chosen.key;
    game.answers.push({
      questionId: question.id,
      key: chosen.key,
      playType: question.playType,
      beat: "question",
    });
    game.locked = false;
    game.beat = "predict";
    return;
  }

  if (
    game.beat === "question" &&
    question.playType === "plotTwist" &&
    question.twist &&
    !timedOut
  ) {
    applyStats(chosen);
    game.personalKey = chosen.key;
    game.answers.push({
      questionId: question.id,
      key: chosen.key,
      playType: question.playType,
      beat: "question",
    });
    const scored = scoreAnswer({
      timedOut: false,
      remaining,
      duration,
      streak: game.streak,
      playType: question.playType,
      beat: "question",
    });
    game.streak = scored.nextStreak;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    game.score += scored.xp;
    game.lastPoints = scored.xp;
    game.lastBreakdown = scored.breakdown;
    game.roundXpLog.push(scored.xp);
    rememberReaction(
      pickReaction(
        {
          timedOut: false,
          streak: game.streak,
          quick: scored.quick,
          playType: question.playType,
          beat: "question",
          option: chosen,
        },
        game.reactionHistory,
      ),
    );
    game.continueTarget = "twist";
    game.beat = "reaction";
    game.phase = "reaction";
    return;
  }

  if (game.beat === "predict") {
    const popular = popularKey(question);
    game.predictedKey = timedOut ? null : chosen.key;
    game.predictionHit = !timedOut && chosen.key === popular;
  } else {
    applyStats(chosen);
    game.answers.push({
      questionId: question.id,
      key: chosen.key,
      playType: question.playType,
      beat: game.beat,
      timedOut,
    });
  }

  const scored = scoreAnswer({
    timedOut,
    remaining,
    duration,
    streak: game.streak,
    playType: question.playType,
    predictionHit: game.predictionHit,
    beat: game.beat,
  });

  game.streak = scored.nextStreak;
  game.bestStreak = Math.max(game.bestStreak, game.streak);
  game.score += scored.xp;
  game.lastPoints = scored.xp;
  game.lastBreakdown = scored.breakdown;
  game.roundXpLog.push(scored.xp);
  rememberReaction(
    pickReaction(
      {
        timedOut,
        streak: game.streak,
        quick: scored.quick,
        playType: question.playType,
        beat: game.beat,
        option: chosen,
        predictionHit: game.predictionHit,
      },
      game.reactionHistory,
    ),
  );
  game.continueTarget = "next";
  game.beat = "reaction";
  game.phase = "reaction";
}

export function continueAfterReaction() {
  if (game.continueTarget === "twist") {
    game.phase = "playing";
    game.beat = "twist";
    game.locked = false;
    game.selectedKey = null;
    game.timedOut = false;
    game.lastReaction = null;
    return;
  }

  if (game.index + 1 >= game.deck.length) {
    finishGame();
    return;
  }

  game.index += 1;
  game.phase = "playing";
  game.beat = "intro";
  game.locked = false;
  game.lastReaction = null;
  game.timedOut = false;
  game.selectedKey = null;
  game.personalKey = null;
  game.predictedKey = null;
  game.predictionHit = false;
}

export function finishGame() {
  game.personality = pickPersonality(game.stats);
  game.rank = rankForXp(game.score);
  game.highScore = game.rank.id === "chairman" || game.bestStreak >= 4;
  game.phase = "result";
  game.beat = "result";

  if (game.challengeCode) {
    persistChallenge(game.challengeCode, {
      name: game.playerName,
      score: game.score,
      personality: game.personality.name,
      personalityId: game.personality.id,
      rank: game.rank.name,
      answers: game.answers.filter((row) => row.beat === "question" || !row.beat),
      at: Date.now(),
    });
  }
}

export function markShared() {
  game.shared = true;
}

export function questionById(id) {
  return QUESTIONS.find((question) => question.id === id) ?? null;
}
