<template>
  <section class="card question-card" :class="playType">
    <div class="header-row mb-2">
      <p class="tag">{{ emoji }} {{ tag }}</p>
      <p v-if="badge" class="round-pill">{{ badge }}</p>
    </div>
    <p v-if="kicker" class="kicker">{{ kicker }}</p>
    <h2 class="prompt">{{ prompt }}</h2>
  </section>
</template>

<script setup>
defineProps({
  emoji: { type: String, default: "🇳🇬" },
  tag: { type: String, default: "" },
  prompt: { type: String, required: true },
  kicker: { type: String, default: "" },
  badge: { type: String, default: "" },
  playType: { type: String, default: "normal" },
});
</script>
