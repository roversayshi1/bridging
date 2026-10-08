<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { supabase } from '../lib/supabase';

type Note = {
  id: string;
  subtopic_name: string;
  summary: string | null;
  key_concepts: unknown;
  formulas: unknown;
  worked_examples: unknown;
  exam_tips: unknown;
  order_index: number | null;
};

const route = useRoute();
const topicId = computed(() => route.params.topicId as string);
const topicName = ref('');
const notes = ref<Note[]>([]);
const error = ref('');
const expanded = ref<string | null>(null);

async function load() {
  error.value = '';
  const { data: topic } = await supabase.from('topics').select('name, code').eq('id', topicId.value).maybeSingle();
  topicName.value = topic ? `${topic.code ?? ''} · ${topic.name}` : 'Topic';

  const { data, error: err } = await supabase
    .from('notes')
    .select('id, subtopic_name, summary, key_concepts, formulas, worked_examples, exam_tips, order_index')
    .eq('topic_id', topicId.value)
    .order('order_index');
  if (err) error.value = err.message;
  else notes.value = (data as Note[]) || [];
}

function sectionText(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
}

watch(topicId, load, { immediate: true });
</script>

<template>
  <p><RouterLink to="/notes">← Notes</RouterLink></p>
  <h1>{{ topicName }}</h1>
  <p v-if="error" class="error">{{ error }}</p>
  <div v-else-if="!notes.length" style="color: var(--muted)">No notes for this topic yet.</div>
  <div v-else class="grid-topics">
    <article v-for="n in notes" :key="n.id" class="card note-card">
      <button type="button" class="note-toggle" @click="expanded = expanded === n.id ? null : n.id">
        <strong>{{ n.subtopic_name }}</strong>
        <span>{{ expanded === n.id ? '−' : '+' }}</span>
      </button>
      <div v-if="expanded === n.id" class="note-body">
        <p v-if="n.summary" class="note-summary">{{ n.summary }}</p>
        <section v-if="n.key_concepts">
          <h3>Key concepts</h3>
          <pre>{{ sectionText(n.key_concepts) }}</pre>
        </section>
        <section v-if="n.formulas">
          <h3>Formulas</h3>
          <pre>{{ sectionText(n.formulas) }}</pre>
        </section>
        <section v-if="n.worked_examples">
          <h3>Worked examples</h3>
          <pre>{{ sectionText(n.worked_examples) }}</pre>
        </section>
        <section v-if="n.exam_tips">
          <h3>Exam tips</h3>
          <pre>{{ sectionText(n.exam_tips) }}</pre>
        </section>
      </div>
    </article>
  </div>
</template>
