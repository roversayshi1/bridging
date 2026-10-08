<template>
  <div class="card" style="text-align: center; margin-top: 3rem">
    <h1>404</h1>
    <p style="color: var(--muted)">That page does not exist.</p>
    <RouterLink to="/home" class="btn">Home</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
