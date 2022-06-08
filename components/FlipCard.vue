<template>
  <!--
  <article
    class="
      flex flex-col
      bg-white
      rounded
      shadow-md
      border border-true-gray-100
      border-l-4px border-l-yellow-300
      hover:shadow-xl
      transform
      hover:translate-y-[-0.2rem]
      transition
      dark:(bg-dark-400
      border-dark-300)
      dark:hover:(shadow-md
      shadow-light-800)
    "
  >
  -->
  <div
    ref="card"
    class="
      flex flex-col
      border border-true-gray-300
      bg-white
      rounded
      mb-4
      p-4
    "
  >
    <div v-if="!pressed">
      <slot name="default"></slot>
    </div>
    <div v-else>
      <slot name="flip"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useMousePressed } from '@vueuse/core';
const card = ref(null);
const { pressed } = useMousePressed({ hover: true, target: card });
</script>
