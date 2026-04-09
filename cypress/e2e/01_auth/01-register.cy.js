describe('Registration flow', () => {
  it('should fill registration form and submit it', () => {
    cy.viewport(1440, 900)

    cy.visit('https://www.smartsupp.com/')
    cy.contains('Create free account').click()

    //Přesměrování na jinou URL, proto je potřeba použít cy.origin
    cy.origin('https://openid.smartsupp.com', () => {
      cy.contains('Create a free account').should('be.visible')

      //Vyplnění registračního formuláře, použitý selector name, místo data-testid, protože data-testid
      cy.get('input[name="user.attributes.fullname"]', { timeout: 10000 })
        .should('be.visible')
        .type('Test User')

      cy.get('input[name="email"]')
        .should('be.visible')
        .type(`test${Date.now()}@mail.com`)

      cy.get('input[name="password"]')
        .should('be.visible')
        .type('Test1234')

      cy.get('[data-testid="signup-form-submit-button"]')
        .should('be.visible')
        .click()

        //TU mě zastaví CAPCHA, takže nemůžu pokračovat dál a ověřit úspěšnou registraci, 
        //ale pokud by nebyla CAPTCHA, tak bych pokračovala kontrolou URL a případně nějakým elementem na dashboardu, 
        //který by potvrdil úspěšnou registraci a přihlášení uživatele.
    })
  })
})