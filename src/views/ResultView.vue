<template>
  <AppShell>
    <ConfettiBurst :active="revealed && game.highScore" />
    <main v-if="game.personality" class="screen-enter pb-8">
      <div v-if="!revealed" class="card reaction" @click="revealed = true">
        <p class="kicker">ANALYZING YOUR WAHALA</p>
        <h1 class="brand mt-3 text-[2rem]">Hold on...</h1>
        <p class="subtitle">Street IQ, savage level, and the group chat are conferring.</p>
      </div>

      <template v-else>
        <p class="kicker result-reveal">FINAL RESULT</p>
        <h1 class="brand mt-2 text-[2rem] result-reveal">YOUR NAIJA PERSONALITY</h1>
        <p class="tiny mt-2 result-reveal">
          {{ game.score }} XP · {{ game.rank?.emoji }} {{ game.rank?.name }}
        </p>

        <ResultCard
          class="mt-5 result-reveal"
          :personality="game.personality"
          :stats="displayStats"
          :xp="game.score"
          :rank="game.rank"
        />

        <div class="card mt-4 result-reveal">
          <p class="kicker">HOW YOU PLAYED</p>
          <p class="mt-2 text-sm leading-relaxed">
            {{ game.playerName }}, you stacked {{ game.score }} XP
            <span v-if="game.bestStreak">
              with a best streak of {{ game.bestStreak }}</span
            >. Personality comes from your choices. XP comes from speed,
            streaks, crowd calls, and finishing rounds.
          </p>
          <p class="tiny mt-2">{{ game.rank?.blurb }}</p>
        </div>

        <div class="card mt-4 result-reveal">
          <p class="kicker">PERSONALITY STATS</p>
          <StatBar
            v-for="key in extraKeys"
            :key="key"
            :label="STAT_LABELS[key]"
            :value="displayStats[key]"
          />
        </div>

        <div v-if="rivals.length" class="card mt-4">
          <p class="kicker">CHALLENGE BOARD · {{ game.challengeCode }}</p>
          <p class="tiny mt-2">Saved on this device only.</p>
          <div
            v-for="row in rivals"
            :key="row.at"
            class="mt-3 flex justify-between gap-3 text-sm"
          >
            <span>{{ row.name }}</span>
            <strong>{{ row.score }} · {{ row.personality }}</strong>
          </div>
        </div>

        <CompareAnswers :mine="personalAnswers" :rival="headToHead" />

        <p v-if="notice" class="toast mt-4">{{ notice }}</p>

        <div class="stack mt-5">
          <button class="btn btn-primary" @click="share">SHARE RESULT</button>
          <p class="mt-1 text-center text-lg font-extrabold">
            Think your friend can beat you?
          </p>
          <button class="btn btn-secondary" @click="challengeFriend">
            CHALLENGE A FRIEND
          </button>
          <button class="btn btn-secondary" @click="playAgain">PLAY AGAIN</button>
          <button class="btn btn-ghost" @click="router.push('/')">HOME</button>
        </div>
      </template>
    </main>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import CompareAnswers from "../components/CompareAnswers.vue";
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
const revealed = ref(false);
const extraKeys = ["social", "savage", "patience", "negotiation"];
let revealTimer = null;

const rivals = computed(() =>
  loadChallengeScores(game.challengeCode).sort((a, b) => b.score - a.score),
);

const personalAnswers = computed(() =>
  game.answers.filter((row) => row.beat === "question" || !row.beat),
);

const headToHead = computed(() => {
  const others = rivals.value.filter((row) => row.name !== game.playerName);
  return others.find((row) => row.answers?.length) || null;
});

onMounted(() => {
  if (!game.personality) {
    router.replace("/");
    return;
  }
  revealTimer = setTimeout(() => {
    revealed.value = true;
  }, 900);
});

onBeforeUnmount(() => {
  if (revealTimer) clearTimeout(revealTimer);
});

async function share() {
  notice.value = "";
  try {
    const file = await renderResultCard({
      personality: game.personality,
      stats: displayStats.value,
      score: game.score,
      rank: game.rank,
    });
    const result = await shareResult({
      personality: game.personality,
      stats: displayStats.value,
      score: game.score,
      rank: game.rank,
      challengeCode: game.challengeCode,
      file,
    });
    markShared();
    notice.value =
      result === "copied"
        ? "Result copied. Paste it in the group yourself."
        : "Share sheet opened. Send it from there.";
  } catch (error) {
    if (error?.name === "AbortError") return;
    notice.value = "Couldn’t share automatically. Screenshot the card above.";
  }
}

async function challengeFriend() {
  if (!game.challengeCode) {
    game.challengeCode = generateChallengeCode();
  }
  const url = `${window.location.origin}/friends?code=${game.challengeCode}`;
  const text = `WHO DEY MAD? 🇳🇬\nI got ${game.personality.name}. Same questions — code ${game.challengeCode}`;
  notice.value = "";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "WHO DEY MAD?", text, url });
      markShared();
      notice.value = "Share sheet opened.";
      router.push({ path: "/friends", query: { code: game.challengeCode } });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    markShared();
    notice.value = `Challenge link copied · ${game.challengeCode}`;
  } catch {
    notice.value = `Share this code manually: ${game.challengeCode}`;
  }
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
