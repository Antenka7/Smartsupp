# Smartsupp – E2E Testing (Cypress)

Tento repozitář obsahuje E2E testy pro Smartsupp aplikaci, zaměřené na Mira AI flow.

---

## How to Run

### Prerequisity
- Node.js + nainstalované závislosti (`npm install`)
- Platný testovací účet v Smartsupp (přihlašovací údaje v `cypress/support/commands.js`)

### Spuštění testů

Testy jsou navrženy ke spouštění **v pořadí podle číslování složek**:

```
01_auth → 02_onboarding → 03_management
```

> ⚠️ **Důležité:** `03_management/edit-bot-step.cy.js` předpokládá, že existující bot byl vytvořen v předchozím kroku (`02_onboarding/create-bot.cy.js`). Bez spuštění onboardingu test nenajde bota a selže.

```bash
# Spustit Cypress UI
npx cypress open

# Nebo headless v pořadí
npx cypress run --spec "cypress/e2e/01_auth/**,cypress/e2e/02_onboarding/**,cypress/e2e/03_management/**"
```

---

## Testing Approach

Před implementací automatizovaných testů jsem nejdříve prošla aplikaci manuálně, abych:
- pochopila celý flow (onboarding → edit bot → publish),
- zjistila, jak se jednotlivé kroky chovají,
- identifikovala potenciálně problematická místa pro automatizaci.

Na základě toho jsem následně připravila E2E testy v Cypressu.

---

## Test Coverage

| Test | Popis |
|------|-------|
| `01_auth/01-register.cy.js` | Registrace nového účtu |
| `01_auth/02-login.cy.js` | Přihlášení |
| `02_onboarding/create-bot.cy.js` | Onboarding – vytvoření bota |
| `03_management/edit-bot-step.cy.js` | Edit bot happy path – Behavior, Knowledge (Text + Web scrape), Welcome message, Skills, Publish, cleanup |

---

## Tools & Assistance

Při implementaci testů byly využity AI nástroje:
- ChatGPT
- Claude (Cowork mode)

Tyto nástroje sloužily jako podpora pro:
- kontrolu a úpravu Cypress testů,
- návrh a zpřehlednění struktury kódu,
- asistenci při debugování specifických problémů (např. práce s toggle komponentami).

Veškerá logika testů, pochopení flow aplikace a identifikace bugů vychází z manuálního testování a vlastního návrhu.

---

## Challenges During Testing

### 1. Toggle / switch komponenty

Největší problém při automatizaci představovaly toggle (switch) prvky napříč aplikací.

**Problémy:**
- standardní Cypress `.check()` / `.click()` nefungoval spolehlivě,
- stav nebyl vždy správně reflektovaný (`checked` vs `aria-checked`),
- Chakra UI skrývá input přes `position: absolute; width: 1px` – viditelný je jen `label`.

**Řešení:**
- vytvoření custom helperu `toggleSwitcher()`,
- práce s `aria-checked` atributem místo nativního `checked`,
- klikání přes `label.chakra-switch`,
- dvouprůchodový přístup pro případ DOM re-renderu po kliknutí.

### 2. CAPTCHA při registraci

Během testování registrace blokovala CAPTCHA.

**Problém:** nebylo možné automatizovat registraci standardní cestou.

**Řešení:** používání existujícího testovacího účtu (`cy.loginToSmartsupp()`), onboarding testovaný až po přihlášení.

### 3. Pochopení flow aplikace

Flow aplikace není na první pohled lineární – některé kroky se zobrazují podle stavu účtu a předchozí konfigurace.

**Dopad:** bylo nutné testy postupně stabilizovat a zjednodušit na happy path.

---

## Known Bugs / Issues

### Bug #1 – Registrace - Onboarding: nefunguje šipka zpět

- **Oblast:** AI onboarding / navigation
- **Typ:** UI / navigation bug
- **Priorita:** Medium
- **Popis:** V onboarding flow po registraci nefunguje šipka zpět. Uživatel se nemůže vrátit na předchozí krok.
- **Očekávané chování:** Po kliknutí na šipku zpět se uživatel vrátí na předchozí krok.
- **Aktuální chování:** Kliknutí na šipku nic neudělá.

### Bug #2 – AI onboarding: nekonečný loader po zadání URL

- **Oblast:** AI onboarding / Website information
- **Typ:** Functional bug
- **Priorita:** High
- **Popis:** Po zadání webové adresy a kliknutí na Continue se zobrazí velmi dlouhý nebo nekonečný loading.

**Kroky k reprodukci:**
1. Otevřít Mira AI onboarding
2. Kliknout na `Get Started`
3. Vybrat `I have a service website`
4. Kliknout na `Continue`
5. Zadat URL (např. `example.com`) a kliknout `Retrieve pages`
6. Kliknout `Continue`

- **Očekávané chování:** Přechod na další krok flow.
- **Aktuální chování:** Loader běží velmi dlouho nebo nekonečně.
- **Workaround v testech:** Kliknutí na Mira AI v sidebaru → `Skip`.

---

## Summary

- Největší technická výzva: práce s toggle komponentami (Chakra UI)
- Největší funkční problém: onboarding flow (blokující bug)
- Testy jsou aktuálně postavené na stabilním happy path flow
