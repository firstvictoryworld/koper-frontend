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
      },
      forgotPassword: 'Password dimenticata'
    },
    changePassword: 'Modifica password',
    createPassword: {
      title: 'Crea password',
      fields: {
        password: 'Password',
        password_confirmation: 'Conferma password',
      },
    },
    forgotPassword: {
      title: 'Password dimenticata',
      emailAndUsername: 'Codice utente',
      submit: 'Invia',
      message: 'Una nuova email per il login è stata inviata',
      error: 'L`utente non esiste'
    }
  },
}
