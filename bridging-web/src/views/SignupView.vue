<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { supabase } from '../lib/supabase';

const router = useRouter();
const email = ref('');
const password = ref('');
const fullName = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  const { error: err } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: { data: { full_name: fullName.value.trim() || undefined } },
  });
  loading.value = false;
  if (err) {
    error.value = err.message;
    return;
  }
  router.push('/dashboard');
}
</script>

<template>
  <div class="card" style="max-width: 420px; margin: 2rem auto">
    <h1>Sign up</h1>
    <p style="color: var(--muted); font-size: 0.9rem">
      Fresh start on Supabase — old WeWeb passwords do not carry over.
    </p>
    <form @submit.prevent="submit">
      <div class="field">
        <label>Name</label>
        <input v-model="fullName" type="text" autocomplete="name" />
      </div>
      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" required autocomplete="email" />
      </div>
      <div class="field">
        <label>Password</label>
        <input v-model="password" type="password" required minlength="8" autocomplete="new-password" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn" type="submit" :disabled="loading">{{ loading ? '…' : 'Create account' }}</button>
    </form>
    <p style="margin-top: 1rem">
      <RouterLink to="/login">Already have an account?</RouterLink>
    </p>
  </div>
</template>
