<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile, supabase } from '../lib/supabase';

const router = useRouter();
const email = ref('');
const fullName = ref('');
const level = ref('');
const role = ref('');
const message = ref('');
const error = ref('');

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  email.value = user?.email ?? '';
  const p = await getProfile();
  fullName.value = p?.full_name ?? '';
  level.value = p?.level ?? '';
  role.value = p?.role ?? 'student';
});

async function save() {
  error.value = '';
  message.value = '';
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error: err } = await supabase
    .from('profiles')
    .update({ full_name: fullName.value.trim() || null, level: level.value.trim() || null })
    .eq('id', user.id);
  if (err) error.value = err.message;
  else message.value = 'Saved.';
}

async function signOut() {
  await supabase.auth.signOut();
  router.push('/home');
}
</script>

<template>
  <h1>Account</h1>
  <div class="card" style="max-width: 480px">
    <p style="color: var(--muted); font-size: 0.9rem">Signed in as {{ email }} ({{ role }})</p>
    <form @submit.prevent="save">
      <div class="field">
        <label>Display name</label>
        <input v-model="fullName" type="text" />
      </div>
      <div class="field">
        <label>Level</label>
        <input v-model="level" type="text" placeholder="e.g. Sec 4" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="message" class="success">{{ message }}</p>
      <button class="btn" type="submit">Save profile</button>
    </form>
    <button type="button" class="btn btn-ghost" style="margin-top: 1rem" @click="signOut">Sign out</button>
  </div>
</template>
