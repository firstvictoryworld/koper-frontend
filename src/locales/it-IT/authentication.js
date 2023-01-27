export default {
  authentication: {
    login: {
      title: 'Login',
      submit: 'Accedi',
      fields: {
        emailAndUsername: 'Codice utente',
        password: 'Password'
      },
      errors: {
        unauthorized: 'Le credenziali non sono valide. Si prega di riprovare.'
      }
    },
    changePassword: 'Modifica password',
    createPassword: {
      title: 'Crea password',
      fields: {
        password: 'Password',
        password_confirmation: 'Conferma password',
      },
    }
  },
}
