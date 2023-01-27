export const agreementDeeds = {
  path: '/agreement-deeds',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'agreement-deeds',
      path: '',
      component: () => import('@/views/agreement-deeds/agreement-deeds-page.vue'),
    },
  ],
}
