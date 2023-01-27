export const bookings = {
  path: '/bookings',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'bookings',
      path: '',
      component: () => import('@/views/bookings/bookings-page.vue'),
    },
  ],
}
