<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase, getProfile, type Profile } from './lib/supabase';
import AppNav from './components/AppNav.vue';

const profile = ref<Profile | null>(null);
const ready = ref(false);

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) profile.value = await getProfile();
  ready.value = true;
  supabase.auth.onAuthStateChange(async (_event, session) => {
    profile.value = session ? await getProfile() : null;
  });
});
</script>

<template>
  <div v-if="!ready" class="loading-screen">Loading…</div>
  <div v-else class="app-root">
    <AppNav :profile="profile" />
    <main class="main">
      <router-view />
    </main>
  </div>
</template>
