/// <reference types="cypress" />

context('Login page', () => {
  describe('Style', () => {
    it('Assess style and text has loaded correctly', () => {
      cy.visit('/authentication/login-page')
      cy.get('[data-test="login-title"]').should('contain.text', 'Koperniko')
      cy.get('[data-test="login-icon"]').should('be.visible')
      cy.get('[data-test="form-title"').should('contain.text', 'Log in')
      cy.get('[data-test="form-email"]').should('be.visible')
        .and('contain.text', 'Email')
        .and('contain.value', '')
      cy.get('[data-test="form-password"]').should('be.visible')
        .and('contain.text', 'Password')
        .and('contain.value', '')
      cy.get('[data-test="form-button"]').should('be.visible').and('contain.text', 'Log in')
    })
  })
  describe('Functionality', {
    env: {
      API_URL: '',
      DB_USER_MAIL: '',
      DB_USER_PASSWORD: '',
    },
  }, () => {
    it('Try to login with empty fields, get rejected', () => {
      cy.get('[data-test="form-error"]').should('not.exist')
      cy.get('[data-test="form-button"]').click()
      cy.get('[data-test="form-error"]')
        .should('be.visible')
        .and('contain.text', 'Log in fields cannot be empty. Please, fill them out.')
      cy.get('[data-test="form-email"]').type('fake@email.com')
      cy.get('[data-test="form-button"]').click()
      cy.get('[data-test="form-error"]')
        .should('be.visible')
        .and('contain.text', 'Log in fields cannot be empty. Please, fill them out.')
      cy.get('[data-test="form-email"]').clear()
      cy.get('[data-test="form-password"]').type('fakepassword')
      cy.get('[data-test="form-button"]').click()
      cy.get('[data-test="form-error"]')
        .should('be.visible')
        .and('contain.text', 'Log in fields cannot be empty. Please, fill them out.')
    })
    it('Try to login with invalid credentials, get rejected', () => {
      cy.visit('/authentication/login-page')
      cy.get('[data-test="form-error"]').should('not.exist')
      cy.get('[data-test="form-email"]').type('fake@email.com')
      cy.get('[data-test="form-password"]').type('fakepassword')
      cy.get('[data-test="form-button"]').click()
      cy.intercept(Cypress.env('API_URL')).as('fakeLogin')
      cy.wait('@fakeLogin').its('response.body').should('include', { error: 'Invalid credentials!' }).should('have.property', 'error')

      cy.get('[data-test="form-error"]')
        .should('be.visible')
        .and('contain.text', 'Credentials are invalid. Please, try again.')
    })
    it('Try to login with valid credentials, get redirected to main page', () => {
      cy.visit('/authentication/login-page')
      cy.get('[data-test="form-error"]').should('not.exist')
      cy.get('[data-test="form-email"]').type(Cypress.env('DB_USER_MAIL'))
      cy.get('[data-test="form-password"]').type(Cypress.env('DB_USER_PASSWORD'))
      cy.get('[data-test="form-button"]').click()
      cy.intercept(Cypress.env('API_URL')).as('trueLogin')
      cy.wait('@trueLogin').its('response.body').should('have.property', 'jwt')
      cy.get('[data-test="form-error"]').should('not.exist')
      cy.url().should('include', '/main/')
    })
  })
})

