/// <reference types="cypress" />

Cypress.Commands.add('loginToSmartsupp', () => {
  const email = Cypress.env('SMARTSUPP_EMAIL')
  const password = Cypress.env('SMARTSUPP_PASSWORD')

  cy.viewport(1440, 900)
  cy.visit('https://www.smartsupp.com/')

  cy.contains('Log in').should('be.visible').click()

  cy.origin(
    'https://openid.smartsupp.com',
    { args: { email, password } },
    ({ email, password }) => {
      cy.get('input[name="username"]', { timeout: 10000 })
        .should('be.visible')
        .type(email)

      cy.get('input[name="password"]')
        .should('be.visible')
        .type(password, { log: false })

      cy.contains('button', 'Log in')
        .should('be.visible')
        .click()
    }
  )
})