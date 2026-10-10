<template>
  <AppShell>
    <main class="screen-enter">
      <button class="tiny mb-4" @click="router.push('/')">← Home</button>
      <p class="kicker">SQUAD MODE</p>
      <h1 class="brand mt-2 text-[2.1rem]">Play with friends</h1>
      <p class="subtitle">
        Same questions. Same chaos. Compare answers on this device, or share a
        code so a friend can play the same deck later.
      </p>

      <section class="card mt-6 stack">
        <label class="tiny" for="name">Your display name</label>
        <input
          id="name"
          v-model="name"
          class="field"
          maxlength="18"
          placeholder="e.g. Chika"
        />

        <p class="tiny">Challenge code</p>
        <div class="flex gap-2">
          <input
            v-model="code"
            class="field uppercase tracking-[0.2em]"
            maxlength="6"
          />
          <button class="btn btn-secondary w-auto px-4" @click="mint">
            NEW
          </button>
        </div>
        <p class="tiny">
          Scores and answers stay in this browser for the prototype. Nothing is
          sent to a server.
        </p>
      </section>

      <p v-if="notice" class="toast mt-4">{{ notice }}</p>

      <div class="stack mt-5">
        <button class="btn btn-secondary" @click="shareOrCopy">
          SHARE CHALLENGE LINK
        </button>
        <button
          class="btn btn-primary"
          :disabled="code.length < 4"
          @click="start"
        >
          START THE WAHALA
        </button>
      </div>

      <section v-if="board.length" class="card mt-6">
        <p class="kicker">BOARD ON THIS DEVICE</p>
        <div
          v-for="row in board"
          :key="row.at"
          class="mt-3 flex justify-between gap-3 text-sm"
        >
          <span>{{ row.name }}</span>
          <strong>{{ row.score }} XP · {{ row.personality }}</strong>
        </div>
      </section>
    </main>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "../components/AppShell.vue";
import {
  generateChallengeCode,
  loadChallengeScores,
  startGame,
} from "../game/store";

const router = useRouter();
const route = useRoute();
const name = ref("You");
const code = ref("");
const notice = ref("");

const board = computed(() =>
  loadChallengeScores(code.value.toUpperCase()).sort(
    (a, b) => b.score - a.score,
  ),
);

onMounted(() => {
  code.value = (route.query.code || generateChallengeCode())
    .toString()
    .toUpperCase();
});

function mint() {
  code.value = generateChallengeCode();
  notice.value = "";
}

function challengeUrl() {
  return `${window.location.origin}/friends?code=${code.value.toUpperCase()}`;
}

async function shareOrCopy() {
  const url = challengeUrl();
  const text = `WHO DEY MAD? 🇳🇬\nSame questions. Beat my Naija energy.\nCode: ${code.value.toUpperCase()}`;
  notice.value = "";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title: "WHO DEY MAD?", text, url });
      notice.value = "Share sheet opened. Send it yourself from there.";
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    notice.value = "Link copied. Drop it in the group yourself.";
  } catch {
    notice.value = "Couldn’t copy. Long-press the code and share it manually.";
  }
}

function start() {
  startGame({
    mode: "friends",
    challengeCode: code.value.toUpperCase(),
    playerName: name.value.trim() || "You",
  });
  router.push({
    path: "/game",
    query: { mode: "friends", code: code.value.toUpperCase() },
  });
}
</script>
