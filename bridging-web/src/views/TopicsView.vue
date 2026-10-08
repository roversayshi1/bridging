<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../lib/supabase';

type Topic = {
  id: string;
  code: string | null;
  name: string;
  category: string;
  description: string | null;
  question_count: number;
};

const topics = ref<Topic[]>([]);
const error = ref('');

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('topics')
    .select('id, code, name, category, description, question_count')
    .order('code');
  if (err) error.value = err.message;
  else topics.value = data || [];
});
</script>

<template>
  <h1>Topics</h1>
  <p style="color: var(--muted)">Syllabus map with practice question counts.</p>
  <p v-if="error" class="error">{{ error }}</p>
  <div v-else class="grid-topics">
    <div v-for="t in topics" :key="t.id" class="card">
      <h2 style="font-size: 1.1rem; margin: 0 0 0.5rem">{{ t.code }} · {{ t.name }}</h2>
      <p style="color: var(--muted); margin: 0 0 0.75rem">{{ t.description || t.category }}</p>
      <p style="font-size: 0.85rem; margin-bottom: 0.75rem">{{ t.question_count }} practice questions</p>
      <RouterLink :to="`/notes/topic/${t.id}`" class="btn btn-ghost" style="margin-right: 0.5rem">Notes</RouterLink>
      <RouterLink :to="`/practice?topic=${t.id}`" class="btn">Practice</RouterLink>
    </div>
  </div>
</template>
