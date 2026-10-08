<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { supabase } from '../lib/supabase';

type Topic = { id: string; code: string | null; name: string; category: string; question_count: number };

const topics = ref<Topic[]>([]);
const error = ref('');

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('topics')
    .select('id, code, name, category, question_count')
    .order('code');
  if (err) error.value = err.message;
  else topics.value = data || [];
});
</script>

<template>
  <h1>Notes</h1>
  <p v-if="error" class="error">{{ error }}</p>
  <p v-else-if="!topics.length" style="color: var(--muted)">No topics loaded. Expose the <code>bridging</code> schema in Supabase API settings.</p>
  <div v-else class="grid-topics">
    <RouterLink
      v-for="t in topics"
      :key="t.id"
      :to="`/notes/topic/${t.id}`"
      class="topic-row"
    >
      <span>{{ t.code }} · {{ t.name }}</span>
      <span style="color: var(--muted); font-size: 0.85rem">{{ t.category }}</span>
    </RouterLink>
  </div>
</template>
