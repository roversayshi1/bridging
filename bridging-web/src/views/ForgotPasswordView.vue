<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { ref } from 'vue';
import { supabase } from '../lib/supabase';

const email = ref('');
const message = ref('');
const error = ref('');

async function submit() {
  error.value = '';
  message.value = '';
  const { error: err } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
    redirectTo: `${window.location.origin}/login`,
  });
  if (err) error.value = err.message;
  else message.value = 'If that email exists, a reset link was sent. Check your inbox (Resend/SMTP must be configured in Supabase).';
}
</script>

<template>
  <div class="card" style="max-width: 420px; margin: 2rem auto">
    <h1>Reset password</h1>
    <form @submit.prevent="submit">
      <div class="field">
        <label>Email</label>
        <input v-model="email" type="email" required />
      </div>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="message" class="success">{{ message }}</p>
      <button class="btn" type="submit">Send reset link</button>
    </form>
    <p style="margin-top: 1rem"><RouterLink to="/login">Back to log in</RouterLink></p>
  </div>
</template>
