export const reconciliations = {
  path: '/reconciliations',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'reconciliations',
      path: '',
      component: () => import('@/views/reconciliations/reconciliations-page.vue'),
    },
  ],
}
