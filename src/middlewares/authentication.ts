import type { RouteMiddlewareFunction } from "@/@types"
import { NotGuestException, UnauthenticatedException } from "@/exceptions/AuthenticationException"
import { useUsersStore } from "@/stores/users"

export const isAutneticated: RouteMiddlewareFunction = (to)  => {
 
    const store = useUsersStore()
  
    if (to.meta.requiresAuth && !store.isLogged) {
      throw new UnauthenticatedException()
    }

    return true
}

export const isGuest: RouteMiddlewareFunction = (to)  => {
 
  const store = useUsersStore()

  if (to.meta.requiresAuth === false && store.isLogged) {
    throw new NotGuestException()
  }

  return true
}
