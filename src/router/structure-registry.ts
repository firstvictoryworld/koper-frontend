export const structureRegistry = {
  path: '/structure-registry',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'structure-registry',
      path: '',
      component: () => import('@/views/structure-registry/structure-registry-page.vue'),
    },
  ],
}
