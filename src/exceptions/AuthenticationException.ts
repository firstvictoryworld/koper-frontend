import { BaseException } from './BaseException'

export class UnauthenticatedException extends BaseException {
  constructor () {
    super()
    this.redirect = { name: 'login' }
  }
}

export class NotGuestException extends BaseException {
  constructor () {
    super()
    this.redirect = { name: 'home' }
  }
}