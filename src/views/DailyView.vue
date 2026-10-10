<template>
  <AppShell>
    <main class="screen-enter">
      <button class="tiny mb-4" @click="router.push('/')">← Home</button>
      <p class="kicker">🔥 {{ DAILY_CHALLENGE.title }}</p>
      <h1 class="brand mt-2 text-[2rem]">{{ DAILY_CHALLENGE.kicker }}</h1>

      <section class="card mt-5">
        <p class="prompt">{{ DAILY_CHALLENGE.prompt }}</p>
      </section>

      <div v-if="!picked" class="stack mt-4">
        <button
          v-for="option in DAILY_CHALLENGE.options"
          :key="option.key"
          class="option"
          @click="answer(option)"
        >
          <span class="option-key">{{ option.key }}</span>
          <span>{{ option.text }}</span>
        </button>
      </div>

      <section v-else class="mt-5">
        <div class="card reaction">
          <p class="kicker">THE STREETS SAY</p>
          <p class="mt-3 text-lg font-semibold">
            {{ DAILY_CHALLENGE.reactions[picked] }}
          </p>
        </div>
        <div class="card mt-4">
          <p class="kicker">AUDIENCE MIX</p>
          <p class="tiny mt-2">
            Prototype mix — not live votes. Real percentages appear only when
            a backend records answers.
          </p>
          <div class="bar-compare mt-4">
            <div
              v-for="option in DAILY_CHALLENGE.options"
              :key="option.key"
              class="bar-compare-row"
            >
              <div class="flex justify-between text-sm">
                <span>{{ option.key }} — {{ option.text }}</span>
                <strong>{{ DAILY_CHALLENGE.results[option.key] }}%</strong>
              </div>
              <div class="stat-track">
                <div
                  class="stat-fill"
                  :style="{
                    width: `${DAILY_CHALLENGE.results[option.key]}%`,
                    opacity: option.key === picked ? 1 : 0.45,
                  }"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="stack mt-5">
          <button class="btn btn-primary" @click="playFull">
            PLAY THE FULL GAME
          </button>
          <button class="btn btn-secondary" @click="router.push('/')">HOME</button>
        </div>
      </section>
    </main>
  </AppShell>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import { DAILY_CHALLENGE } from "../data/daily";
import { startGame } from "../game/store";

const router = useRouter();
const picked = ref("");
const storageKey = `wdm-daily-${new Date().toISOString().slice(0, 10)}`;

onMounted(() => {
  picked.value = localStorage.getItem(storageKey) || "";
});

function answer(option) {
  picked.value = option.key;
  localStorage.setItem(storageKey, option.key);
}

function playFull() {
  startGame({ mode: "solo" });
  router.push("/game");
}
</script>
