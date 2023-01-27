import { createI18n } from 'vue-i18n'
import it from './it'

type MessageSchema = typeof it

const i18n = createI18n<[MessageSchema], 'it-IT'>({
  legacy: false,
  locale: 'it-IT',
  fallbackLocale: 'it-IT',
  messages: {
    'it-IT': it
  },
})

export default i18n
