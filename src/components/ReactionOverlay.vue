<template>
  <section class="card reaction">
    <p class="kicker">{{ kicker }}</p>
    <p class="mt-3 text-lg font-semibold leading-snug">{{ text }}</p>
    <p class="points-pop">+{{ xp }} XP</p>
    <p v-if="detail" class="tiny mt-2">{{ detail }}</p>
    <p v-if="streak >= 2" class="streak-chip">🔥 {{ streak }} streak</p>
    <button class="btn btn-primary mt-6" @click="$emit('next')">
      {{ nextLabel }}
    </button>
  </section>
</template>

<script setup>
defineProps({
  kicker: { type: String, default: "THE STREETS SAY" },
  text: { type: String, required: true },
  xp: { type: Number, default: 0 },
  detail: { type: String, default: "" },
  streak: { type: Number, default: 0 },
  nextLabel: { type: String, default: "NEXT WAHALA" },
});

defineEmits(["next"]);
</script>
