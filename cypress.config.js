const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.smartsupp.com',
  },
  env: {
    SMARTSUPP_EMAIL: 'anetamarienkova+smartsupp@gmail.com',
    SMARTSUPP_PASSWORD: 'Smartsupp2026+',
  },
})