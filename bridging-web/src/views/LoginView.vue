<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { supabase } from '../lib/supabase';

const route = useRoute();
const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  });
  loading.value = false;
  if (err) {
    error.value = err.message;
    return;
  }
  const redirect = (route.query.redirect as string) || '/dashboard';
  router.push(redirect);
}
</script>

<template>
  <div class="card" style="max-width: 420px; margin: 2rem auto">
    <h1>Log in</h1>
    <form @submit.prevent="submit">
      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" required autocomplete="email" />
      </div>
      <div class="field">
        <label>Password</label>
        <input v-model="password" type="password" required autocomplete="current-password" />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <button class="btn" type="submit" :disabled="loading">{{ loading ? '…' : 'Log in' }}</button>
    </form>
    <p style="margin-top: 1rem; font-size: 0.9rem">
      <RouterLink to="/forgot-password">Forgot password?</RouterLink>
      ·
      <RouterLink to="/signup">Sign up</RouterLink>
    </p>
  </div>
</template>
