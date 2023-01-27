export const tariff = {
  path: '/tariff',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'tariff',
      path: '',
      component: () => import('@/views/tariff/tariff-page.vue'),
    },
  ],
}
