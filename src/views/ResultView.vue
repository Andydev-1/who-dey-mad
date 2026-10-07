<template>
  <AppShell>
    <ConfettiBurst :active="game.highScore" />
    <main v-if="game.personality" class="screen-enter pb-8">
      <p class="kicker">FINAL RESULT</p>
      <h1 class="brand mt-2 text-[2rem]">YOUR NAIJA PERSONALITY</h1>
      <p class="tiny mt-2">Score {{ game.score }} · {{ game.answers.length }} rounds of wahala</p>

      <ResultCard class="mt-5" :personality="game.personality" :stats="displayStats" />

      <div class="card mt-4">
        <p class="kicker">FULL READ</p>
        <StatBar
          v-for="key in extraKeys"
          :key="key"
          :label="STAT_LABELS[key]"
          :value="displayStats[key]"
        />
      </div>

      <div v-if="rivals.length" class="card mt-4">
        <p class="kicker">CHALLENGE BOARD · {{ game.challengeCode }}</p>
        <div v-for="row in rivals" :key="row.at" class="mt-3 flex justify-between text-sm">
          <span>{{ row.name }}</span>
          <strong>{{ row.score }} · {{ row.personality }}</strong>
        </div>
      </div>

      <p v-if="notice" class="toast mt-4">{{ notice }}</p>

      <div class="stack mt-5">
        <button class="btn btn-primary" @click="share">SHARE RESULT</button>
        <p class="mt-1 text-center text-lg font-extrabold">Think your friend can beat you?</p>
        <button class="btn btn-secondary" @click="challengeFriend">CHALLENGE A FRIEND</button>
        <button class="btn btn-secondary" @click="playAgain">PLAY AGAIN</button>
        <button class="btn btn-ghost" @click="router.push('/')">HOME</button>
      </div>
    </main>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import ConfettiBurst from "../components/ConfettiBurst.vue";
import ResultCard from "../components/ResultCard.vue";
import StatBar from "../components/StatBar.vue";
import { STAT_LABELS } from "../data/questions";
import {
  displayStats,
  game,
  generateChallengeCode,
  loadChallengeScores,
  markShared,
  startGame,
} from "../game/store";
import { renderResultCard, shareResult } from "../game/share";

const router = useRouter();
const notice = ref("");
const extraKeys = ["social", "savage", "patience", "negotiation"];

const rivals = computed(() =>
  loadChallengeScores(game.challengeCode).sort((a, b) => b.score - a.score),
);

onMounted(() => {
  if (!game.personality) router.replace("/");
});

async function share() {
  notice.value = "";
  try {
    const file = await renderResultCard({
      personality: game.personality,
      stats: displayStats.value,
      score: game.score,
    });
    const result = await shareResult({
      personality: game.personality,
      stats: displayStats.value,
      score: game.score,
      challengeCode: game.challengeCode,
      file,
    });
    markShared();
    notice.value = result === "copied" ? "Result copied. Go gist your group chat." : "Shared. Make them mad.";
  } catch (error) {
    if (error?.name === "AbortError") return;
    markShared();
    notice.value = "Couldn’t share automatically. Screenshot the card above.";
  }
}

function challengeFriend() {
  if (!game.challengeCode) {
    game.challengeCode = generateChallengeCode();
  }
  const url = `${window.location.origin}/friends?code=${game.challengeCode}`;
  navigator.clipboard?.writeText(url);
  notice.value = `Challenge link copied · ${game.challengeCode}`;
  markShared();
  router.push({ path: "/friends", query: { code: game.challengeCode } });
}

function playAgain() {
  startGame({
    mode: game.mode,
    challengeCode: game.challengeCode,
    playerName: game.playerName,
  });
  router.push("/game");
}
</script>
