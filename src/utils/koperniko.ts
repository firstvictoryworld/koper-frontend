import type { InjectionKey } from "vue"

export const appReloadCurrentUserInjectionKey = Symbol('$reloadCurrentUser injection key') as InjectionKey<() => Promise<void>>
