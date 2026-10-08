<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getProfile } from '../lib/supabase';

const name = ref('');

onMounted(async () => {
  const p = await getProfile();
  name.value = p?.full_name || 'Student';
});
</script>

<template>
  <h1>Dashboard</h1>
  <p style="color: var(--muted)">Welcome back, {{ name }}.</p>
  <div class="grid-topics" style="margin-top: 1.5rem">
    <RouterLink to="/notes" class="topic-row"><span>Revision notes</span><span>→</span></RouterLink>
    <RouterLink to="/practice" class="topic-row"><span>Practice</span><span>→</span></RouterLink>
    <RouterLink to="/topics" class="topic-row"><span>All topics</span><span>→</span></RouterLink>
  </div>
</template>
