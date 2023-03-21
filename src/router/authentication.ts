export const authentication = {
  path: '/authentication',
  component: () => import ('@/layouts/guest/GuestLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'login',
      path: 'login',
      component: () => import('@/views/authentication/login-page.vue'),
    },
    {
      name: 'password-reset',
      path: 'password-reset',
      component: () => import('@/views/authentication/password-creation.vue'),
    },
    {
      name: 'forgot-password',
      path: 'forgot-password',
      component: () => import('@/views/authentication/forgot-password.vue'),
    },
  ],
}
 