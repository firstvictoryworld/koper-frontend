export abstract class BaseException {
  message?: string
  code?: number
  redirect?: {
    name?: string
    path?: string
  }
}
