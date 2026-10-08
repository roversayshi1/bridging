<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { markApiUrl, supabase } from '../lib/supabase';

type Question = {
  id: string;
  prompt: string;
  explanation: string;
  difficulty: string;
  topic_id: string;
};

const route = useRoute();
const topicFilter = computed(() => (route.query.topic as string) || '');

const question = ref<Question | null>(null);
const answer = ref('');
const loading = ref(false);
const marking = ref(false);
const error = ref('');
const result = ref<{
  isCorrect: boolean;
  verdict: string;
  feedback?: string;
} | null>(null);

async function loadQuestion() {
  error.value = '';
  result.value = null;
  answer.value = '';
  loading.value = true;

  let query = supabase.from('questions').select('id, prompt, explanation, difficulty, topic_id').limit(50);
  if (topicFilter.value) query = query.eq('topic_id', topicFilter.value);

  const { data, error: err } = await query;
  loading.value = false;
  if (err) {
    error.value = err.message;
    question.value = null;
    return;
  }
  const pool = data || [];
  if (!pool.length) {
    error.value = 'No questions found for this filter.';
    question.value = null;
    return;
  }
  question.value = pool[Math.floor(Math.random() * pool.length)] as Question;
}

async function submit() {
  if (!question.value) return;
  marking.value = true;
  error.value = '';
  result.value = null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(markApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({
      questionId: question.value.id,
      studentAnswer: answer.value,
    }),
  });

  marking.value = false;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    error.value = body.error || `Marking failed (${res.status})`;
    return;
  }
  result.value = {
    isCorrect: body.isCorrect,
    verdict: body.verdict,
    feedback: body.feedback,
  };
}

watch(topicFilter, loadQuestion);
onMounted(loadQuestion);
</script>

<template>
  <h1>Practice</h1>
  <p style="color: var(--muted)">
    Marking runs on this site’s API — no WeWeb backend.
    <button type="button" class="linkish" @click="loadQuestion">New question</button>
  </p>
  <p v-if="loading" style="color: var(--muted)">Loading question…</p>
  <p v-if="error" class="error">{{ error }}</p>

  <div v-if="question && !loading" class="card practice-card">
    <span class="pill">{{ question.difficulty }}</span>
    <p class="prompt">{{ question.prompt }}</p>
    <form @submit.prevent="submit">
      <div class="field">
        <label>Your answer</label>
        <input v-model="answer" type="text" required autocomplete="off" />
      </div>
      <button class="btn" type="submit" :disabled="marking">{{ marking ? 'Checking…' : 'Check answer' }}</button>
    </form>

    <div v-if="result" class="mark-result" :class="result.isCorrect ? 'ok' : 'bad'">
      <p><strong>{{ result.isCorrect ? 'Correct' : 'Not quite' }}</strong> · {{ result.verdict }}</p>
      <p v-if="result.feedback">{{ result.feedback }}</p>
      <details v-if="question.explanation">
        <summary>Explanation</summary>
        <p>{{ question.explanation }}</p>
      </details>
    </div>
  </div>
</template>
