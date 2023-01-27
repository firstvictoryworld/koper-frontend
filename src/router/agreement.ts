export const agreement = {
  path: '/agreements',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'agreement-page',
      path: '',
      component: () => import('@/views/agreements/agreement-page.vue'),
    },
  ],
}
