export const doctors = {
  path: '/doctors',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'doctors',
      path: '',
      component: () => import('@/views/doctors/doctors-page.vue'),
    },
  ],
}
