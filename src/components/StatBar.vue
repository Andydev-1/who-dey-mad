<template>
  <div class="stat-row">
    <div class="stat-row-top">
      <span>{{ label }}</span>
      <strong>{{ value }}%</strong>
    </div>
    <div class="stat-track">
      <div class="stat-fill" :style="{ width: `${value}%` }" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: { type: Number, default: 0 },
});
</script>
