<template>
  <section class="card round-intro text-center" @click="$emit('skip')">
    <p class="kicker">ROUND {{ current }}/{{ total }}</p>
    <h2 class="brand mt-3 text-[2rem]">{{ title }}</h2>
    <p class="subtitle">{{ kicker }}</p>
    <p class="tiny mt-4">Tap to start</p>
  </section>
</template>

<script setup>
defineProps({
  current: Number,
  total: Number,
  title: String,
  kicker: String,
});

defineEmits(["skip"]);
</script>
