import { createVuetify } from 'vuetify'
import type { ThemeDefinition } from 'vuetify'

import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const LightTheme: ThemeDefinition = {
  dark: false,
  variables: {},
  colors: {
    'koperniko-primary': '#25316D',
    'koperniko-info': '#FFFD82',
    'koperniko-success': '#4DA167',
    'koperniko-accent': '#D90368',
    'koperniko-warning': '#FFA62B',
    'koperniko-error': '#BA1200',
    'koperniko-secondary': '#489FB5',
    'koperniko-fondo-color': '#034078',
    'koperniko-purple': '#6C5D8F',
    'koperniko-white': '#FFFFFF',
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: LightTheme,
    },
  },
  defaults: {
    VBtn: {
      color: 'primary',
      rounded: 'md',
      flat: true,
      fontWeight: '400',
      letterSpacing: '0',
    },
    VCard: {
      flat: true,
      elevation: 10,
    },
  },
})
