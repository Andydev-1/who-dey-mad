<template>
  <section v-if="rows.length" class="card mt-4">
    <p class="kicker">HEAD-TO-HEAD</p>
    <p class="tiny mt-2">Same questions. Same device scores for this prototype.</p>
    <div v-for="row in rows" :key="row.id" class="compare-row">
      <p class="tiny mb-1">{{ row.tag }}</p>
      <p class="text-sm font-semibold leading-snug">{{ row.prompt }}</p>
      <div class="mt-2 flex justify-between gap-3 text-sm">
        <span>You: <strong>{{ row.yours }}</strong></span>
        <span>{{ rivalName }}: <strong>{{ row.theirs }}</strong></span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { questionById } from "../game/store";

const props = defineProps({
  mine: { type: Array, default: () => [] },
  rival: { type: Object, default: null },
});

const rivalName = computed(() => props.rival?.name || "Friend");

const rows = computed(() => {
  if (!props.rival?.answers?.length) return [];
  const theirs = new Map(
    props.rival.answers.map((row) => [row.questionId, row.key]),
  );
  return props.mine
    .filter((row) => theirs.has(row.questionId))
    .slice(0, 6)
    .map((row) => {
      const question = questionById(row.questionId);
      const optionText = (key) =>
        question?.options?.find((option) => option.key === key)?.text || key;
      return {
        id: row.questionId,
        tag: question?.tag || "Round",
        prompt: question?.prompt?.split("\n")[0] || "",
        yours: optionText(row.key),
        theirs: optionText(theirs.get(row.questionId)),
      };
    });
});
</script>
