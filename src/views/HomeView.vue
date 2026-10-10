<template>
  <AppShell>
    <main class="screen-enter home-screen">
      <div>
        <p class="kicker">NAIJA PARTY GAME</p>
        <div class="home-hero">
          <div>
            <h1 class="brand mt-3">WHO DEY MAD? 🇳🇬</h1>
            <p class="subtitle">
              Prove you're the most Nigerian person in the group.
            </p>
          </div>
          <Mascot />
        </div>
        <p class="rotating-line">{{ line }}</p>
      </div>

      <DailyPreview class="mt-6" :challenge="DAILY_CHALLENGE" @open="router.push('/daily')" />

      <div class="stack mt-6">
        <button class="btn btn-primary" @click="playSolo">PLAY SOLO</button>
        <button class="btn btn-secondary" @click="router.push('/friends')">
          PLAY WITH FRIENDS
        </button>
        <button class="btn btn-secondary" @click="router.push('/daily')">
          DAILY CHALLENGE
        </button>
      </div>

      <p class="tiny mt-8 text-center">
        {{ ROUND_SIZE }} chaotic rounds. Mixed tempos. XP, streaks, and one
        Naija personality you can’t unsay.
      </p>
    </main>
  </AppShell>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import DailyPreview from "../components/DailyPreview.vue";
import Mascot from "../components/Mascot.vue";
import { DAILY_CHALLENGE } from "../data/daily";
import { ROTATING_LINES } from "../data/homeCopy";
import { ROUND_SIZE } from "../data/rounds";
import { startGame } from "../game/store";

const router = useRouter();
const line = ref(ROTATING_LINES[0]);
let rotate = null;

onMounted(() => {
  let index = 0;
  rotate = setInterval(() => {
    index = (index + 1) % ROTATING_LINES.length;
    line.value = ROTATING_LINES[index];
  }, 3800);
});

onBeforeUnmount(() => {
  if (rotate) clearInterval(rotate);
});

function playSolo() {
  startGame({ mode: "solo" });
  router.push("/game");
}
</script>
