export const certification = {
  path: '/certification',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'certification',
      path: '',
      component: () => import('@/views/certification/certification-page.vue'),
    },
  ],
}
