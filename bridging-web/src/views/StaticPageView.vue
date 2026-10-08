<script setup lang="ts">
const props = defineProps<{ slug: string }>();

const copy: Record<string, { title: string; body: string }> = {
  about: {
    title: 'About Bridging',
    body: 'Bridging helps Singapore O-Level E-Math students revise with structured notes and instant practice marking. This app is hosted on Vercel with Supabase auth and data — independent of WeWeb.',
  },
  privacy: {
    title: 'Privacy',
    body: 'We store account and learning data in Supabase (Singapore/EU hosting per your Supabase project). Practice attempts are tied to your user id. Contact the site owner for data requests.',
  },
  terms: {
    title: 'Terms',
    body: 'Use Bridging for personal study. Content is for educational purposes. Accounts are subject to fair use; admins may suspend abuse.',
  },
};

const page = copy[props.slug] ?? { title: 'Page', body: 'Not found.' };
</script>

<template>
  <article class="card" style="max-width: 640px">
    <h1>{{ page.title }}</h1>
    <p style="line-height: 1.6; color: var(--muted)">{{ page.body }}</p>
  </article>
</template>
