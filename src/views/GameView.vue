<template>
  <AppShell>
    <main v-if="question" class="screen-enter">
      <div class="header-row">
        <p class="kicker">ROUND {{ progress.current }}/{{ progress.total }}</p>
        <p class="tiny mb-0 font-bold text-white">{{ game.score }} pts</p>
      </div>

      <div class="timer-wrap mb-4">
        <div class="timer-track">
          <div
            :key="game.index"
            class="timer-fill"
            :class="{
              urgent: remaining <= 3,
              drain: game.phase === 'playing',
              frozen: game.phase !== 'playing',
            }"
          />
        </div>
        <strong class="w-8 text-right">{{ remaining }}</strong>
      </div>

      <section class="card">
        <p class="tag">{{ question.emoji }} {{ question.tag }}</p>
        <h2 class="prompt">{{ question.prompt }}</h2>
      </section>

      <div v-if="game.phase === 'playing'" class="stack mt-4">
        <button
          v-for="option in question.options"
          :key="option.key"
          class="option"
          @click="pick(option)"
        >
          <span class="option-key">{{ option.key }}</span>
          <span>{{ option.text }}</span>
        </button>
      </div>

      <section v-else class="card reaction mt-4">
        <p class="kicker">
          {{ game.timedOut ? "TIME UP" : "THE STREETS SAY" }}
        </p>
        <p class="mt-3 text-lg font-semibold leading-snug">
          {{ game.lastReaction }}
        </p>
        <p class="points-pop">+{{ game.lastPoints }}</p>
        <button class="btn btn-primary mt-6" @click="next">
          {{ isLast ? "SEE MY PERSONALITY" : "NEXT WAHALA" }}
        </button>
      </section>
    </main>
  </AppShell>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import {
  applyAnswer,
  continueAfterReaction,
  currentQuestion,
  game,
  progress,
  QUESTION_SECONDS,
  startGame,
} from "../game/store";

const router = useRouter();
const route = useRoute();
const remaining = ref(QUESTION_SECONDS);
const question = currentQuestion;
const isLast = computed(() => game.index + 1 >= game.deck.length);

let timer = null;

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startTimer() {
  clearTimer();
  remaining.value = QUESTION_SECONDS;
  timer = setInterval(() => {
    remaining.value -= 1;
    if (remaining.value <= 0) {
      clearTimer();
      applyAnswer(null, { timedOut: true });
    }
  }, 1000);
}

function pick(option) {
  clearTimer();
  applyAnswer(option);
}

function next() {
  continueAfterReaction();
  if (game.phase === "result") {
    router.replace("/result");
  }
}

watch(
  () => [game.phase, game.index],
  ([phase]) => {
    if (phase === "playing") startTimer();
    else clearTimer();
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
  startTimer();
});

onBeforeUnmount(clearTimer);
</script>
