<template>
  <AppShell>
    <main v-if="question" class="screen-enter">
      <div class="header-row">
        <p class="kicker">
          {{ typeMeta.label }} · {{ progress.current }}/{{ progress.total }}
        </p>
        <p class="tiny mb-0 font-bold text-white">{{ game.score }} XP</p>
      </div>

      <div class="timer-wrap mb-4">
        <div class="timer-track">
          <div
            class="timer-fill"
            :class="{
              urgent: remaining <= 3 && timedBeat,
              frozen: !timedBeat,
            }"
            :style="timerStyle"
          />
        </div>
        <strong class="w-8 text-right">{{ timedBeat ? remaining : "—" }}</strong>
      </div>

      <p v-if="game.streak >= 2 && timedBeat" class="streak-chip mb-3">
        🔥 {{ game.streak }} streak
      </p>

      <RoundIntro
        v-if="game.beat === 'intro'"
        :current="progress.current"
        :total="progress.total"
        :title="typeMeta.label"
        :kicker="typeMeta.kicker"
        @skip="startRound"
      />

      <template v-else-if="game.beat === 'reaction'">
        <ReactionOverlay
          :kicker="reactionKicker"
          :text="game.lastReaction"
          :xp="game.lastPoints"
          :detail="roundDetail"
          :streak="game.streak"
          :next-label="nextLabel"
          @next="next"
        />
      </template>

      <template v-else>
        <QuestionCard
          :key="`${game.index}-${game.beat}`"
          class="question-enter"
          :emoji="question.emoji"
          :tag="question.tag"
          :prompt="activePrompt"
          :kicker="beatKicker"
          :badge="typeMeta.label"
          :play-type="question.playType"
        />

        <AnswerOptions
          class="mt-4"
          :options="activeOptions"
          :selected-key="game.selectedKey"
          :disabled="game.locked"
          @pick="pick"
        />
      </template>
    </main>
  </AppShell>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AnswerOptions from "../components/AnswerOptions.vue";
import AppShell from "../components/AppShell.vue";
import QuestionCard from "../components/QuestionCard.vue";
import ReactionOverlay from "../components/ReactionOverlay.vue";
import RoundIntro from "../components/RoundIntro.vue";
import { ROUND_TYPES } from "../data/rounds";
import { popularKey } from "../game/deck";
import {
  applyAnswer,
  beginQuestion,
  continueAfterReaction,
  currentQuestion,
  currentSeconds,
  game,
  isLastRound,
  progress,
  startGame,
} from "../game/store";

const router = useRouter();
const route = useRoute();
const remaining = ref(20);
const question = currentQuestion;

const timedBeat = computed(() =>
  ["question", "twist", "predict"].includes(game.beat),
);

const typeMeta = computed(
  () => ROUND_TYPES[question.value?.playType] || ROUND_TYPES.normal,
);

const timerStyle = computed(() => {
  const duration = currentSeconds.value || 1;
  const width = timedBeat.value ? `${(remaining.value / duration) * 100}%` : "0%";
  return { width };
});

const activePrompt = computed(() => {
  if (game.beat === "twist") return question.value.twist.prompt;
  if (game.beat === "predict") {
    return "Which answer do you think most Nigerians picked? (Prototype mix, not live votes.)";
  }
  return question.value.prompt;
});

const activeOptions = computed(() => {
  if (game.beat === "twist") return question.value.twist.options;
  return question.value.options;
});

const beatKicker = computed(() => {
  if (game.beat === "predict") return "NOW READ THE ROOM";
  if (game.beat === "twist") return "PLOT TWIST";
  return "";
});

const reactionKicker = computed(() => {
  if (game.timedOut) return "TIME UP";
  if (game.continueTarget === "twist") return "WAIT...";
  if (question.value?.playType === "unpopular") return "THE CROWD SAYS";
  return "THE STREETS SAY";
});

const roundDetail = computed(() => {
  const bits = [];
  const br = game.lastBreakdown;
  if (!br) return "";
  if (br.speed) bits.push(`speed +${br.speed}`);
  if (br.streak) bits.push(`streak +${br.streak}`);
  if (br.prediction) bits.push(`crowd call +${br.prediction}`);
  if (br.bonus) bits.push(`bonus +${br.bonus}`);
  if (question.value?.playType === "unpopular" && game.predictedKey) {
    const popular = popularKey(question.value);
    bits.push(
      game.predictionHit
        ? "You called the popular pick"
        : `Most picked ${popular} (prototype mix)`,
    );
  }
  return bits.join(" · ");
});

const nextLabel = computed(() => {
  if (game.continueTarget === "twist") return "SEE THE TWIST";
  if (isLastRound.value) return "SEE MY PERSONALITY";
  return "NEXT WAHALA";
});

let timer = null;
let introTimer = null;

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function clearIntro() {
  if (introTimer) {
    clearTimeout(introTimer);
    introTimer = null;
  }
}

function startTimer() {
  clearTimer();
  remaining.value = currentSeconds.value;
  timer = setInterval(() => {
    remaining.value -= 1;
    if (remaining.value <= 0) {
      clearTimer();
      applyAnswer(null, { timedOut: true, remaining: 0 });
    }
  }, 1000);
}

function startRound() {
  clearIntro();
  beginQuestion();
}

function pick(option) {
  if (game.locked) return;
  clearTimer();
  applyAnswer(option, { remaining: remaining.value });
}

function next() {
  continueAfterReaction();
  if (game.phase === "result") {
    router.replace("/result");
  }
}

watch(
  () => [game.beat, game.index],
  ([beat]) => {
    clearTimer();
    clearIntro();
    if (beat === "intro") {
      introTimer = setTimeout(() => startRound(), 1100);
      return;
    }
    if (["question", "twist", "predict"].includes(beat)) {
      startTimer();
      return;
    }
    clearTimer();
  },
);

onMounted(() => {
  if (!game.deck.length) {
    const mode = route.query.mode === "friends" ? "friends" : "solo";
    const code = typeof route.query.code === "string" ? route.query.code : null;
    startGame({ mode, challengeCode: code });
  }
  if (game.phase === "result") {
    router.replace("/result");
    return;
  }
  if (game.beat === "intro") {
    introTimer = setTimeout(() => startRound(), 1100);
  } else if (timedBeat.value) {
    startTimer();
  }
});

onBeforeUnmount(() => {
  clearTimer();
  clearIntro();
});
</script>
