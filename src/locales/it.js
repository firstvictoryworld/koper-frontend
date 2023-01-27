import globals from './it-IT/global'
import guestPage from './it-IT/guestPage'
import authentication from './it-IT/authentication'
import registration from './it-IT/registration'
import validation from './it-IT/validation'
import layout from './it-IT/layout'
import enums from './it-IT/enums'
import structure from './it-IT/structure'
import table from './it-IT/table'
import account from './it-IT/account'
import home from './it-IT/home'
import agreement from './it-IT/agreement'
import tariff from './it-IT/tariff'
import doctors from './it-IT/doctors'
import specializations from './it-IT/specializations'
import lendings from './it-IT/lendings'
import bookings from './it-IT/bookings'
import reconciliations from './it-IT/reconciliations'
import certification from './it-IT/certification'
import agreementDeed from './it-IT/agreement-deed'
import registry from './it-IT/structure-registry'
import users from './it-IT/users'

// FIXME refator deprecate file

export default {
  ...globals,
  ...guestPage,
  ...authentication,
  ...registration,
  ...validation,
  ...layout,
  ...enums,
  ...structure,
  ...table,
  ...account,
  ...home,
  ...agreement,
  ...tariff,
  ...doctors,
  ...specializations,
  ...lendings,
  ...bookings,
  ...reconciliations,
  ...certification,
  ...agreementDeed,
  ...registry,
  ...users
}
