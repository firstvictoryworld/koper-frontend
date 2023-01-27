import UserTypes from "@/enums/UserTypesEnum";

export const mainMenu = [
  {
    title: 'mainMenu.home',
    to: '/',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-home',
    disabled: false,
    alwaysActive: true
  },
  ///////////////////////////////////////////////////////////////////////////////////////
  {
    header: 'Gestione anagrafica struttura',
    allowedTypes: [
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ]
  },
  {
    title: 'mainMenu.anagraficaStruttura',
    to: '/structure-registry',
    allowedTypes: [
      UserTypes.STRUTTURA,
      UserTypes.BACKOFFICE
    ],
    icon: 'mdi-handshake',
    disabled: false
  },
   ///////////////////////////////////////////////////////////////////////////////////////
  {
    header: 'Gestione fondo',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ]
  },
  {
    title: 'mainMenu.structures',
    to: '/structures',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE
    ],
    icon: 'mdi-handshake',
    disabled: false
  },
  {
    title: 'mainMenu.tariffario',
    to: '/tariff',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-cash-multiple',
    disabled: false
  },
  {
    title: 'mainMenu.medici',
    to: '/doctors',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-doctor',
    disabled: false
  },
  {
    title: 'mainMenu.specializations',
    to: '/specializations',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE
    ],
    icon: 'mdi-stethoscope',
    disabled: false
  },
  {
    title: 'mainMenu.convenzionamento',
    to: '/agreements',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-handshake',
    disabled: false
  },
  {
    title: 'mainMenu.attiConvenzionamento',
    to: '/agreement-deeds',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-file-document-multiple',
    disabled: false
  },
  {
    title: 'mainMenu.certificazioneUnica',
    to: '/certification',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-file-document-check',
    disabled: false
  },
  ///////////////////////////////////////////////////////////////////////////////////////
  {
    header: 'Gestione pratiche',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ]
  },
  {
    title: 'mainMenu.prenotazioni',
    to: '/bookings',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-folder',
    disabled: false
  },
  {
    title: 'mainMenu.riconciliamento',
    to: '/reconciliations',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    icon: 'mdi-bank',
    disabled: false
  },
  ///////////////////////////////////////////////////////////////////////////////////////
  {
    header: 'Amministrazione',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE
    ]
  },
  {
    title: 'mainMenu.utenti',
    to: '/todo',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE
    ],
    icon: 'mdi-account-multiple',
    disabled: true
  },
]

////////

export const topMenu = [
  {
    icon: 'mdi-cog',
    title: 'topMenu.profile',
    to: { name: 'account' }
  },
  {
    icon: 'mdi-lock-open',
    title: 'topMenu.logout',
    to: { name: 'login' },
    logout: true,
  },
]
