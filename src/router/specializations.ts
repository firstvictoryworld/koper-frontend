export const specializations = {
  path: '/specializations',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'specializations',
      path: '',
      component: () => import('@/views/specializations/specializations-page.vue'),
    },
  ],
}
