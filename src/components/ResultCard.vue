<template>
  <article class="result-card" ref="cardRef">
    <p class="kicker">WHO DEY MAD? 🇳🇬</p>
    <p class="eyebrow">YOUR NAIJA PERSONALITY</p>
    <h2>{{ personality.emoji }} {{ personality.name }}</h2>
    <p class="tagline">{{ personality.tagline }}</p>
    <p v-if="rank" class="tiny mt-2">
      {{ xp }} XP · {{ rank.emoji }} {{ rank.name }}
    </p>
    <p class="desc">{{ personality.description }}</p>
    <div class="result-stats">
      <StatBar
        v-for="key in highlightKeys"
        :key="key"
        :label="STAT_LABELS[key]"
        :value="stats[key]"
      />
    </div>
    <p class="cta">What's YOUR Naija personality?</p>
  </article>
</template>

<script setup>
import { STAT_LABELS } from "../data/questions";
import StatBar from "./StatBar.vue";

defineProps({
  personality: { type: Object, required: true },
  stats: { type: Object, required: true },
  xp: { type: Number, default: 0 },
  rank: { type: Object, default: null },
});

const highlightKeys = ["streetIq", "wahala", "financial", "lagos"];
</script>
