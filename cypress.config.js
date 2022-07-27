const { defineConfig } = require("cypress");
const setupNodeEvents = require('./cypress/plugins/index.js')

module.exports = defineConfig({
  "env": {
    "NETWORK_ID": 31337,
    "PROVIDER_HOST": "http://localhost:8545/",
    "PRIVATE_TEST_WALLET_PK": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "PRIVATE_TEST_WALLET_ADDRESS": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "cypress-react-selector": {
      "root": "#root"
    }
  },
  "e2e": { 
    setupNodeEvents,
    "supportFile": "cypress/support/commands.ts",
    "specPattern":	"cypress/integration/*.test.ts",
    "baseUrl": "http://localhost:3000",
    "pageLoadTimeout": 40000,
    "responseTimeout": 40000,
    "defaultCommandTimeout": 40000,
    "requestTimeout": 40000,
    "video": true,
    "viewportWidth": 1440,
    "viewportHeight": 1080
  }
})
