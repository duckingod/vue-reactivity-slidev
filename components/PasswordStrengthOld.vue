<script setup lang="ts">
import Card from './Card.vue';
import $ from 'jquery';
import { onMounted } from 'vue';

const handleInput = (val) => {
  $('#strength').text(val && val.target.value.length >= 8 ? 'strong' : 'weak');
}
handleInput('');
onMounted($('#password').on('input', handleInput));
</script>

<template>
  <Card>
    Password: <input id="password"/> <br/>
    Strength: <span id="strength"></span>
  </Card>
</template>
