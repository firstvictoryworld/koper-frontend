export const registration = {
  path: '/registration',
  component: () => import ('@/layouts/guest/GuestLayout.vue'),
  meta: {
    requiresAuth: false
  },
  children: [
    {
      name: 'registration',
      path: '',
      component: () => import('@/views/registration/registration-page.vue'),
    }
  ]
}

export const structures = {
  path: '/structures',
  component: () => import ('@/layouts/full/FullLayout.vue'),
  meta: {
    requiresAuth: true
  },
  children: [
    {
      name: '',
      path: '',
      component: () => import('@/views/structures/structures-page.vue'),
    }
  ]
}
 