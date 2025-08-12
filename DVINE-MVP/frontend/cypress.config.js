import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // React 19 + Vite 6 compatibility settings
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalSessionAndOrigin: true,
    // Increase timeouts for slower environments
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    // Disable video recording to reduce overhead
    video: false,
    // Disable screenshots on failure to reduce overhead
    screenshotOnRunFailure: false,
    chromeWebSecurity: false,
    browser: 'chrome',
    viewportWidth: 1280,
    viewportHeight: 720,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      apiUrl: 'http://localhost:8080'
    },
    // Headless mode specific settings
    headless: true,
    // Better error handling for headless mode
    experimentalRunAllSpecs: true,
    // Wait for app to be ready
    waitForAnimations: true,
    // Reduce flakiness
    scrollBehavior: 'center'
  },
});
