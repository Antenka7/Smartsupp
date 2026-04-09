/// <reference types="cypress" />
describe('Login flow', () => {
  it('should log in existing user', () => {
    cy.viewport(1440, 900)

    cy.visit('https://www.smartsupp.com/')
    cy.contains('Log in').should('be.visible').click()

    const email = Cypress.env('SMARTSUPP_EMAIL')
    const password = Cypress.env('SMARTSUPP_PASSWORD')

    cy.origin(
      'https://openid.smartsupp.com',
      { args: { email, password } },
      ({ email, password }) => {
        cy.get('[data-testid="signin-email"]', { timeout: 10000 })
          .should('be.visible')
          .type(email)

        cy.get('[data-testid="signin-password"]')
          .should('be.visible')
          .type(password, { log: false })

        cy.get('[data-testid="signin-submit"]')
          .should('be.visible')
          .click()
      }
    )

    cy.location('pathname', { timeout: 20000 }).should('include', '/app')

    cy.url().then((url) => {
      if (url.includes('onboarding')) {
        cy.log('User is in onboarding')
      } else {
        cy.log('User is in dashboard')
      }
    })
  })
})