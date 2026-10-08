<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { supabase } from '../lib/supabase';

type Legacy = { id: string; email: string; source: string | null; created_at: string };

const rows = ref<Legacy[]>([]);
const error = ref('');

onMounted(async () => {
  const { data, error: err } = await supabase
    .from('legacy_users')
    .select('id, email, source, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (err) error.value = err.message;
  else rows.value = data || [];
});
</script>

<template>
  <h1>Admin</h1>
  <p style="color: var(--muted)">
    Legacy WeWeb emails (proof list only). Users must sign up fresh on Supabase.
  </p>
  <p v-if="error" class="error">{{ error }}</p>
  <table v-else class="admin-table">
    <thead>
      <tr>
        <th>Email</th>
        <th>Source</th>
        <th>Recorded</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in rows" :key="r.id">
        <td>{{ r.email }}</td>
        <td>{{ r.source || '—' }}</td>
        <td>{{ new Date(r.created_at).toLocaleDateString() }}</td>
      </tr>
    </tbody>
  </table>
</template>
