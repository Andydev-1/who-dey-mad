<template>
  <AppShell>
    <main
      class="screen-enter flex min-h-[calc(100dvh-52px)] flex-col justify-between"
    >
      <div>
        <p class="kicker">NAIJA PARTY GAME</p>
        <h1 class="brand mt-3">WHO DEY MAD? 🇳🇬</h1>
        <p class="subtitle">
          Prove you're the most Nigerian person in the group.
        </p>
        <div class="live-chip">
          <span class="pulse" />
          🔥 {{ playersToday.toLocaleString() }} players played today
        </div>
      </div>

      <div class="stack mt-10">
        <button class="btn btn-primary" @click="playSolo">PLAY SOLO</button>
        <button class="btn btn-secondary" @click="router.push('/friends')">
          PLAY WITH FRIENDS
        </button>
        <button class="btn btn-secondary" @click="router.push('/daily')">
          DAILY CHALLENGE
        </button>
      </div>

      <p class="tiny mt-8 text-center">
        8 chaotic rounds. 20 seconds each. One Naija personality you can’t
        unsay.
      </p>
    </main>
  </AppShell>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import { startGame } from "../game/store";

const router = useRouter();
const playersToday = ref(12483);
let bump = null;

onMounted(() => {
  bump = setInterval(() => {
    if (Math.random() > 0.55) playersToday.value += 1;
  }, 2400);
});

onBeforeUnmount(() => {
  if (bump) clearInterval(bump);
});

function playSolo() {
  startGame({ mode: "solo" });
  router.push("/game");
}
</script>
