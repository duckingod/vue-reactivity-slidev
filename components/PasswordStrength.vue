<script setup lang="ts">
import Card from './Card.vue';
import { ref, computed } from 'vue';

const password = ref("");
const strength = computed(() => password.value.length >= 8 ? 'strong' : 'weak');
</script>

<template>
  <Card>
    Password: <input v-model="password"/> <br/>
    Strength: {{ strength }}
  </Card>
</template>
