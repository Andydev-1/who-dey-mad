<template>
  <div class="stack">
    <button
      v-for="option in options"
      :key="option.key"
      class="option"
      :class="{
        picked: selectedKey === option.key,
        dimmed: selectedKey && selectedKey !== option.key,
        hit: hitKey && option.key === hitKey,
      }"
      :disabled="disabled"
      @click="$emit('pick', option)"
    >
      <span class="option-key">{{ option.key }}</span>
      <span>{{ option.text }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  selectedKey: { type: String, default: null },
  hitKey: { type: String, default: null },
  disabled: { type: Boolean, default: false },
});

defineEmits(["pick"]);
</script>
