export const error404 = {
  path: '/:pathMatch(.*)*',
  component: () => import('@/layouts/blank/BlankLayout.vue'),
  children: [
    {
      name: '404',
      path: '',
      component: () => import('@/views/error/404-page.vue')
    }
  ]
}
