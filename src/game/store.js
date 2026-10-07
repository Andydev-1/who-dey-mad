import { computed, reactive } from "vue";
import { QUESTIONS, STAT_KEYS } from "../data/questions";
import { pickPersonality } from "../data/personalities";

export const ROUND_SIZE = 8;
export const QUESTION_SECONDS = 10;

function emptyStats() {
  return STAT_KEYS.reduce((acc, key) => {
    acc[key] = 40;
    return acc;
  }, {});
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function mulberry32(seed) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, seed) {
  const copy = [...list];
  const rng = mulberry32(seed);
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
  lastReaction: null,
  lastPoints: 0,
  timedOut: false,
  personality: null,
  highScore: false,
  shared: false,
});

export const currentQuestion = computed(() => game.deck[game.index] ?? null);
export const progress = computed(() => ({
  current: Math.min(game.index + 1, game.deck.length),
  total: game.deck.length,
}));

export const displayStats = computed(() => {
  const out = {};
  for (const key of STAT_KEYS) {
    out[key] = Math.round(clamp(game.stats[key]));
  }
  return out;
});

export function startGame({ mode = "solo", challengeCode = null, playerName = "You" } = {}) {
  const seed = challengeCode ? hashCode(challengeCode) : Math.floor(Math.random() * 1e9);
  const deck = shuffle(QUESTIONS, seed).slice(0, ROUND_SIZE);

  game.mode = mode;
  game.challengeCode = challengeCode;
  game.playerName = playerName || "You";
  game.deck = deck;
  game.index = 0;
  game.stats = emptyStats();
  game.score = 0;
  game.answers = [];
  game.phase = "playing";
  game.lastReaction = null;
  game.lastPoints = 0;
  game.timedOut = false;
  game.personality = null;
  game.highScore = false;
  game.shared = false;
}

export function applyAnswer(option, { timedOut = false } = {}) {
  if (game.phase !== "playing") return;

  const question = currentQuestion.value;
  if (!question) return;

  const chosen = timedOut
    ? {
        key: "X",
        text: "Froze",
        reaction: "Timer finished you. Even NEPA gives more notice.",
        points: 12,
        stats: { patience: -8, lagos: 4, wahala: 6 },
      }
    : option;

  const nextStats = { ...game.stats };
  for (const [key, delta] of Object.entries(chosen.stats || {})) {
    nextStats[key] = clamp((nextStats[key] ?? 40) + delta);
  }

  game.stats = nextStats;
  game.score += chosen.points;
  game.answers.push({
    questionId: question.id,
    key: chosen.key,
    points: chosen.points,
    timedOut,
  });
  game.lastReaction = chosen.reaction;
  game.lastPoints = chosen.points;
  game.timedOut = timedOut;
  game.phase = "reaction";
}

export function continueAfterReaction() {
  if (game.index + 1 >= game.deck.length) {
    finishGame();
    return;
  }
  game.index += 1;
  game.phase = "playing";
  game.lastReaction = null;
  game.timedOut = false;
}

export function finishGame() {
  game.personality = pickPersonality(game.stats);
  const maxScore = game.deck.length * 96;
  game.highScore = game.score >= maxScore * 0.72;
  game.phase = "result";

  if (game.challengeCode) {
    persistChallenge(game.challengeCode, {
      name: game.playerName,
      score: game.score,
      personality: game.personality.name,
      at: Date.now(),
    });
  }
}

export function markShared() {
  game.shared = true;
}
