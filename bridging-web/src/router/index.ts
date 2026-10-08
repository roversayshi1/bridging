import { createRouter, createWebHistory } from 'vue-router';
import { supabase, getProfile } from '../lib/supabase';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: () => import('../views/HomeView.vue'), meta: { title: 'Bridging' } },
    { path: '/login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
    { path: '/signup', component: () => import('../views/SignupView.vue'), meta: { guest: true } },
    { path: '/forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { guest: true } },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { auth: true },
    },
    { path: '/notes', component: () => import('../views/NotesView.vue'), meta: { auth: true } },
    {
      path: '/notes/topic/:topicId',
      component: () => import('../views/TopicNotesView.vue'),
      meta: { auth: true },
    },
    { path: '/topics', component: () => import('../views/TopicsView.vue'), meta: { auth: true } },
    { path: '/practice', component: () => import('../views/PracticeView.vue'), meta: { auth: true } },
    { path: '/account', component: () => import('../views/AccountView.vue'), meta: { auth: true } },
    {
      path: '/admin',
      component: () => import('../views/AdminView.vue'),
      meta: { auth: true, admin: true },
    },
    { path: '/about', component: () => import('../views/StaticPageView.vue'), props: { slug: 'about' } },
    { path: '/privacy', component: () => import('../views/StaticPageView.vue'), props: { slug: 'privacy' } },
    { path: '/terms', component: () => import('../views/StaticPageView.vue'), props: { slug: 'terms' } },
    { path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') },
  ],
});

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (to.meta.auth && !session) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guest && session) {
    return { path: '/dashboard' };
  }
  if (to.meta.admin) {
    const profile = await getProfile();
    if (profile?.role !== 'admin') return { path: '/dashboard' };
  }
  if (to.meta.title) document.title = `${to.meta.title as string} · Bridging`;
  else document.title = 'Bridging';
});

export default router;
