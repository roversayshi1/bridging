<template>
  <section class="hero">
    <h1>Bridging</h1>
    <p>
      O-Level E-Math revision — structured notes, focused practice, and instant marking. Runs on
      Supabase and Vercel, not WeWeb.
    </p>
    <RouterLink to="/signup" class="btn">Get started free</RouterLink>
    <RouterLink to="/login" class="btn btn-ghost" style="margin-left: 0.75rem">Log in</RouterLink>
  </section>
  <section class="card" style="margin-top: 2rem">
    <h2>How it works</h2>
    <ol style="color: var(--muted); padding-left: 1.2rem">
      <li>Read topic notes aligned to the syllabus</li>
      <li>Practice with real question bank</li>
      <li>Get deterministic marking feedback</li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
