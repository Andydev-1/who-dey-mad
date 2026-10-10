<template>
  <div class="app-shell">
    <div class="glow glow-a" />
    <div class="glow glow-b" />
    <div class="ambient" aria-hidden="true">
      <span v-for="n in 8" :key="n" class="dust" :style="{ '--i': n }" />
    </div>
    <div class="app-frame">
      <slot />
    </div>
  </div>
</template>
