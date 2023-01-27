import { createRouter, createWebHistory } from 'vue-router'
import { base } from './base'
import { authentication } from './authentication'
import { registration, structures } from './structures'
import { agreement } from './agreement'
import { tariff } from './tariff'
import { doctors } from './doctors'
import { specializations } from './specializations'
import { bookings } from './bookings'
import { reconciliations } from './reconciliations'
import { agreementDeeds } from './agreement-deeds'
import { certification } from './certification'
import { structureRegistry } from './structure-registry'
import { error404 } from './errors'
import { isAutneticated, isGuest } from '@/middlewares/authentication'
import type { BaseException } from '@/exceptions/BaseException'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    base,
    authentication,
    registration,
    structures,
    agreement,
    tariff,
    doctors,
    specializations,
    bookings,
    reconciliations,
    agreementDeeds,
    certification,
    structureRegistry,
    
    error404 // keep this one last
  ]
})

const routingDestinationMiddlewares = [
  isAutneticated,
  isGuest
];

router.beforeEach((to) => {
  to.matched.forEach(matchedRoute => routingDestinationMiddlewares.forEach(middleware => middleware(matchedRoute)))
})

router.onError((exception: BaseException) => {
  if (exception.redirect) {
    return router.replace(exception.redirect)
  }
  return false
})

export default router
