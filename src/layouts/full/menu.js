import UserTypes from "@/enums/UserTypesEnum";
import UserAccesses from "@/enums/UserAccessesEnum";
console.log(import.meta.env.VITE_APP_ENV)
export const mainMenu = [
  {
    title: 'mainMenu.home',
    to: '/',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA,
      UserTypes.UTENTE
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
      UserTypes.STRUTTURA,
    ],
    allowedAccesses: UserAccesses.REGISTRY,
  },
  {
    title: 'mainMenu.anagraficaStruttura',
    to: '/structure-registry',
    allowedTypes: [
      UserTypes.STRUTTURA,
      UserTypes.BACKOFFICE
    ],
    allowedAccesses: UserAccesses.REGISTRY,
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
    ],
    allowedAccesses: UserAccesses.TARIFF,
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
    allowedAccesses: UserAccesses.TARIFF,
    icon: 'mdi-cash-multiple',
    disabled: import.meta.env.VITE_APP_ENV === 'staging'? false : true,

   
  },
  {
    title: 'mainMenu.medici',
    to: '/doctors',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    allowedAccesses: UserAccesses.DOCTORS,
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
    allowedAccesses: UserAccesses.NEGOTIATION,
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
    allowedAccesses: UserAccesses.DEEDS,
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
    allowedAccesses: UserAccesses.CERTIFICATION,
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
    ],
  },
  {
    title: 'mainMenu.prenotazioni',
    to: '/bookings',
    allowedTypes: [
      UserTypes.FONDO,
      UserTypes.BACKOFFICE,
      UserTypes.STRUTTURA
    ],
    allowedAccesses: UserAccesses.BOOKINGS,
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
    allowedAccesses: UserAccesses.RECONCILIATION,
    icon: 'mdi-bank',
    disabled: false
  },
  ///////////////////////////////////////////////////////////////////////////////////////
  // {
  //   header: 'Amministrazione',
  //   allowedTypes: [
  //     UserTypes.FONDO,
  //     UserTypes.BACKOFFICE
  //   ],
  // },
  // {
  //   title: 'mainMenu.utenti',
  //   to: '/todo',
  //   allowedTypes: [
  //     UserTypes.FONDO,
  //     UserTypes.BACKOFFICE
  //   ],
  //   icon: 'mdi-account-multiple',
  //   disabled: true
  // },
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
