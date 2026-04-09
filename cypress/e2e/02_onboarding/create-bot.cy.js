/// <reference types="cypress" />

describe('Mira AI - Create bot onboarding', () => {
  it('should go through onboarding happy path', () => {
    cy.loginToSmartsupp()

    cy.origin('https://app.smartsupp.com', () => {
      // otevřít Mira AI / onboarding
      cy.get('[data-testid="sidebar-ai-automations"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // step 1
      cy.contains('Meet Mira AI, your incredible shopping assistant!', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="ai-onboarding-primary-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // step 2
      cy.contains('Select the option that best describes your business', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="ai-onboarding-survey-option-web"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.get('[data-testid="ai-onboarding-primary-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // step 3
      cy.contains('Website information', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="ai-onboarding-input-web-url"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('example.com')

      cy.contains('button', 'Retrieve pages', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.get('[data-testid="ai-onboarding-primary-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // known bug: nekonečný loader -> otevřít znovu přes menu, aby se načetla data
      cy.get('[data-testid="sidebar-ai-automations"]', { timeout: 15000 })
        .should('be.visible')
        .click()

      // skip modal
      cy.contains('Skip Wizard', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="ai-onboarding-navigate-prompt-primary-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // finální ověření dashboardu
      cy.contains('AI Assistants', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="chatbot-card-title-text"]', { timeout: 10000 })
        .should('be.visible')
    })
  })
})