<template>
  <button class="card daily-preview" @click="$emit('open')">
    <p class="kicker">DAILY CHALLENGE</p>
    <p class="mt-2 font-bold leading-snug">{{ challenge.kicker }}</p>
    <p class="tiny mt-2 line-clamp-3">{{ challenge.prompt }}</p>
    <p class="mt-3 text-sm font-extrabold text-[var(--green-2)]">Play today’s gist →</p>
  </button>
</template>

<script setup>
defineProps({
  challenge: { type: Object, required: true },
});

defineEmits(["open"]);
</script>
