<template>
  <div v-if="active" class="confetti" aria-hidden="true">
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="confetti-piece"
      :style="piece.style"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  active: { type: Boolean, default: false },
});

const colors = ["#00C853", "#F8FAFC", "#FBBF24", "#FB7185", "#60A5FA", "#3DDC84"];

const pieces = computed(() =>
  Array.from({ length: 42 }, (_, id) => ({
    id,
    style: {
      left: `${(id * 17) % 100}%`,
      animationDelay: `${(id % 8) * 0.05}s`,
      animationDuration: `${1.8 + (id % 5) * 0.15}s`,
      background: colors[id % colors.length],
      transform: `rotate(${id * 18}deg)`,
    },
  })),
);
</script>
