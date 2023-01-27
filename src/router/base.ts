export const base = {
  path: '/',
  component: () => import('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: 'account',
      path: 'account',
      component: () => import('@/views/account/account-page.vue')
    },
    {
      name: 'home',
      path: '',
      component: () => import('@/views/home/home-page.vue')
    }
  ]
}
