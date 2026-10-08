<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import type { Profile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

defineProps<{ profile: Profile | null }>();
const route = useRoute();

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/notes', label: 'Notes' },
  { to: '/practice', label: 'Practice' },
  { to: '/topics', label: 'Topics' },
];

const showAppLinks = computed(() => route.path !== '/home' && !route.meta.guest);

async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/home';
}
</script>

<template>
  <header class="nav">
    <RouterLink to="/home" class="brand">Bridging</RouterLink>
    <nav v-if="showAppLinks" class="nav-links">
      <RouterLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</RouterLink>
      <RouterLink to="/account">Account</RouterLink>
      <RouterLink v-if="profile?.role === 'admin'" to="/admin">Admin</RouterLink>
      <button type="button" class="link-btn" @click="signOut">Sign out</button>
    </nav>
    <nav v-else class="nav-links">
      <RouterLink to="/login">Log in</RouterLink>
      <RouterLink to="/signup" class="btn-sm">Sign up</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--text);
  text-decoration: none;
}
.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  align-items: center;
}
.nav-links a {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}
.nav-links a.router-link-active {
  color: var(--accent);
}
.link-btn {
  background: none;
  border: none;
  color: var(--muted);
  cursor: pointer;
  font-size: 0.95rem;
}
.btn-sm {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: var(--accent);
  color: #0b1220 !important;
  font-weight: 600;
}
</style>
