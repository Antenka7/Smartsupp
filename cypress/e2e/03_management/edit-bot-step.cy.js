/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Element attr did not return a valid number')) {
    return false
  }
  return true
})

describe('Mira AI - Edit bot', () => {
  it('should edit bot happy path, add text source + web scrape source, publish and return to dashboard', () => {
    cy.loginToSmartsupp()

    cy.origin('https://app.smartsupp.com', () => {
      const uniqueName = `QA-${Date.now()}`

      // Kliknutí do slider tracku na konkrétní pozici
      const clickSliderTrack = (containerSelector, ratio) => {
        cy.get(containerSelector)
          .find('[id^="slider-track-"]')
          .first()
          .should('be.visible')
          .then(($track) => {
            const rect = $track[0].getBoundingClientRect()
            const x = rect.width * ratio
            const y = rect.height / 2
            cy.wrap($track).click(x, y, { force: true })
          })
      }

      // Klik na Mira AI v levém menu — otevře sekci Mira AI
      const openMiraAISection = () => {
        cy.get('[data-testid="sidebar-ai-automations"]', { timeout: 10000 })
          .first()
          .should('be.visible')
          .click()
      }

      // Otevře prvního bota v seznamu
      const openFirstBot = () => {
        cy.get('[data-testid="chatbot-card-title-text"]', { timeout: 10000 })
          .should('be.visible')
          .first()
          .click()
      }

      const clickSaveInDialog = () => {
        cy.get('[role="dialog"]', { timeout: 10000 })
          .filter(':visible')
          .first()
          .should('be.visible')
          .within(() => {
            cy.contains('button', 'Save', { timeout: 10000 })
              .should('be.visible')
              .and('not.be.disabled')
              .click()
          })
      }

      // Přepne switch do požadovaného stavu
      const toggleSwitcher = (config, desiredState = true) => {
        cy.get(config.input, { timeout: 10000 }).should('exist').as('switchInput')

        cy.get('@switchInput').then(($input) => {
          const isChecked =
            $input.attr('aria-checked') === 'true' || $input.is(':checked')
          cy.log(
            `${config.input}: aktuální=${isChecked ? 'ON' : 'OFF'}, požadovaný=${desiredState ? 'ON' : 'OFF'}`
          )
          if (isChecked !== desiredState) {
            cy.get('@switchInput').closest('label.chakra-switch').click()
          }
        })

        cy.get(config.input, { timeout: 5000 }).should(($inp) => {
          const state = $inp.attr('aria-checked') === 'true' || $inp.is(':checked')
          expect(state, `${config.input} má být ${desiredState ? 'ON' : 'OFF'}`).to.eq(desiredState)
        })
      }

      // Na obrazovce Update (web scrape source) vypne auto-update pokud je zapnutý.
      const disableAutoUpdateIfEnabled = () => {
        cy.get('[role="dialog"]', { timeout: 10000 })
          .filter(':visible')
          .first()
          .should('be.visible')
          .within(() => {
            cy.contains('Update', { timeout: 10000 }).should('be.visible')
          })

        toggleSwitcher(
          {
            input: 'input[name="autoUpdate.enabled"]',
            label: 'label.chakra-switch',
          },
          false
        )
      }

      // Ověřím že jsem po přihlášení v appce
      cy.location('pathname', { timeout: 20000 })
        .should('include', '/app')

      // Otevřu AI Assistants dashboard
      openMiraAISection()
      cy.url()
        .should('include', '/ai-automations')

      // Otevřu prvního existujícího bota
      openFirstBot()

      cy.contains('Tone of voice', { timeout: 10000 })
        .should('be.visible')
      cy.contains('Behavior', { timeout: 10000 })
        .should('be.visible')

      clickSliderTrack('[data-testid="chatbot-workflow-profile-input-tone"]', 0.9)
      clickSliderTrack('[data-testid="chatbot-workflow-profile-input-talkativeness"]', 0.2)
      clickSliderTrack('[data-testid="chatbot-workflow-profile-input-confidence"]', 0.8)
      clickSliderTrack('[data-testid="chatbot-workflow-profile-input-emoji"]', 0.7)

      cy.wait(500)

      cy.get('[data-testid="chatbot-workflow-form-continue-btn"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // --- Knowledge — přidání TEXT CONTENT source ---
      cy.contains('Knowledge', { timeout: 10000 }).should('be.visible')
      cy.contains('Sources', { timeout: 10000 }).should('be.visible')

      cy.get('[data-testid="chatbot-workflow-sources-add-new-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.contains('Add new source', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="sources-modal-type-select-text"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.get('[data-testid="sources-modal-continue-button"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      cy.contains('Source detail', { timeout: 10000 })
        .should('be.visible')

      cy.get('[data-testid="sources-modal-name-input"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(uniqueName)

      cy.get('[data-testid="sources-modal-text-input"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('Toto je testovaci textovy obsah pro Mira AI.')

      cy.get('[role="dialog"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .should('be.visible')
        .within(() => {
          cy.contains('button', 'Save', { timeout: 10000 })
            .should('be.visible')
            .and('not.be.disabled')
            .click()
        })

      cy.contains('Knowledge', { timeout: 10000 })
        .should('be.visible')
      cy.contains('Sources', { timeout: 10000 })
        .should('be.visible')
      cy.contains(uniqueName, { timeout: 15000 })
        .should('be.visible')

      // --- Knowledge — přidání WEB SCRAPE source ---
      cy.get('[data-testid="chatbot-workflow-sources-add-new-button"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.contains('Add new source', { timeout: 10000 })
        .should('be.visible')

      cy.get('[role="dialog"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .should('be.visible')
        .within(() => {
          cy.contains('Web scrape', { timeout: 10000 })
            .should('be.visible')
            .click()
        })

      cy.get('[data-testid="sources-modal-continue-button"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      cy.contains('How would you like to import the information?', { timeout: 10000 })
        .should('be.visible')

      cy.get('[role="dialog"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .should('be.visible')
        .within(() => {
          cy.contains('Scan important pages', { timeout: 10000 })
            .should('be.visible')
            .click()
        })

      cy.get('[data-testid="sources-modal-continue-button"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      cy.contains('Source detail', { timeout: 10000 }).should('be.visible')

      cy.get('[data-testid="sources-modal-data-input"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type('example.com')

      cy.get('[role="dialog"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .should('be.visible')
        .within(() => {
          cy.contains('button', 'Retrieve pages', { timeout: 10000 })
            .should('be.visible')
            .and('not.be.disabled')
            .click()
        })

      cy.get('[data-testid="sources-modal-continue-button"]', { timeout: 20000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // Na obrazovce Update vypnu auto-update a uložím (pokud je zapnutý)
      disableAutoUpdateIfEnabled()
      clickSaveInDialog()

      cy.contains('Knowledge', { timeout: 10000 }).should('be.visible')
      cy.contains('Sources', { timeout: 10000 }).should('be.visible')
      cy.contains(uniqueName, { timeout: 15000 }).should('be.visible')

      // Zapnu toggle u každého source který je OFF — dva průchody.
      const enableOffToggles = () => {
        cy.get('label.chakra-switch').filter(':visible').then(($labels) => {
          const offIndices = []
          $labels.each((index, label) => {
            const $input = Cypress.$(label).find('input')
            const isOn = $input.attr('aria-checked') === 'true' || $input.is(':checked')
            if (!isOn) offIndices.push(index)
          })
          offIndices.forEach((index) => {
            cy.get('label.chakra-switch').filter(':visible').eq(index).click()
            cy.wait(300)
          })
        })
      }

      enableOffToggles()
      cy.wait(500)
      enableOffToggles() // druhý průchod — zachytí toggles posunuté re-renderem

      // Počkám dokud oba sources nedosáhnou stavu "Ready" — teprve potom Continue.
      // Publish button je disabled dokud sources nezpracují, takže čekáme zde.
      cy.get('body', { timeout: 90000 }).should(($body) => {
        const readyCount = $body.find('span, div, p, td, li').filter(function () {
          return Cypress.$(this).text().trim() === 'Ready' && Cypress.$(this).children().length === 0
        }).length
        expect(readyCount, 'Čekám na Ready u obou sources (potřebuji ≥ 2)').to.be.gte(2)
      })

      // Continue AŽ když jsou oba toggles ON a oba sources Ready
      cy.get('[data-testid="chatbot-workflow-form-continue-btn"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // --- Welcome message ---
      cy.contains('Welcome message', { timeout: 10000 }).should('be.visible')

      toggleSwitcher(
        {
          input: 'input[name="welcomeMessage.enabled"]',
          label: 'input[name="welcomeMessage.enabled"] + span, input[name="welcomeMessage.enabled"]',
        },
        true
      )

      cy.get('[data-testid="chatbot-workflow-form-continue-btn"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // --- Skills ---
      cy.contains('Skills', { timeout: 10000 }).should('be.visible')

      cy.get('[data-testid="chatbot-workflow-form-continue-btn"]', { timeout: 10000 })
        .should('be.visible')
        .and('not.be.disabled')
        .click()

      // --- Live preview & publish ---
      cy.contains('Live preview & publish', { timeout: 10000 }).should('be.visible')

      cy.get('[data-testid="chatbot-workflow-form-publish-btn"]', { timeout: 60000 })
        .filter(':visible')
        .first()
        .should('not.be.disabled')
        .click()

      // Objeví se modal "You haven't completed the installation yet"
      cy.get('[data-testid="confirm-modal-cancel"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.get('[data-testid="confirm-modal-cancel"]').should('not.exist')

      // Kliknu na Miro AI v levém menu — navigace na AI Assistants dashboard
      cy.get('[data-testid="sidebar-ai-automations"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .click()

      // Modal "The chatbot is not published" se zobrazí po kliknutí na menu —
      // dám 2s appce čas ho vyrenderovat a pak kliknu "Later"
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="prompt-cancel-button"]').filter(':visible').length > 0) {
          cy.log('Modal "The chatbot is not published" — klikám Later')
          cy.get('[data-testid="prompt-cancel-button"]').click()
        }
      })

      // Pokud jsem skončila na /ai-automations (ne přímo na /ai-chatbots), doroutuju
      cy.url().then((url) => {
        if (!url.includes('ai-chatbots')) {
          cy.get('a[href*="ai-chatbots"]', { timeout: 10000 })
            .filter(':visible')
            .first()
            .click()
        }
      })

      cy.url().should('include', 'ai-chatbots')
      cy.contains('AI Assistants', { timeout: 10000 }).should('be.visible')

      // Ověřím že bot v seznamu existuje
      cy.get('[data-testid="chatbot-card-title-text"]', { timeout: 10000 })
        .first()
        .should('be.visible')
        .and('contain.text', 'My first')

      // Označím bota checkboxem
      cy.get('label.chakra-checkbox')
        .filter(':visible')
        .eq(1)
        .click()

      // Po označení se aktivuje tlačítko Delete v toolbaru
      cy.get('[data-testid="delete-bots-button"], [aria-label="Delete"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .click()

      // Potvrdím smazání v modalu
      cy.get('[data-testid="delete-modal-confirm"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // Ověřím že bot zmizel ze seznamu
      cy.get('[data-testid="chatbot-card-title-text"]')
        .should('not.exist')

      // --- Sources ---
      // Přejdu do sekce Sources a smažu všechny sources přidané během testu

      cy.get('[data-testid="submenu-ai-automations-ai-sources"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      cy.url().should('include', '/sources')
      cy.contains('Sources', { timeout: 10000 }).should('be.visible')

      // Označím všechny sources najednou přes header checkbox
      cy.get('label.chakra-checkbox')
        .filter(':visible')
        .eq(0)
        .click()

      // Ověřím že se opravdu označily
      cy.contains('Selected', { timeout: 5000 }).should('be.visible')

      // Kliknu na Delete tlačítko v toolbaru
      cy.get('[aria-label="Delete"]', { timeout: 10000 })
        .filter(':visible')
        .first()
        .click()

      // Potvrdím smazání všech sources v modalu
      cy.get('[data-testid="delete-modal-confirm"]', { timeout: 10000 })
        .should('be.visible')
        .click()

      // Ověřím že Sources seznam je prázdný
      cy.get('label.chakra-checkbox').filter(':visible').should('have.length.lte', 1)
    })
  })
})