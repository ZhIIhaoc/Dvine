// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  // on uncaught exceptions
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  if (err.message.includes('Script error')) {
    return false;
  }
  if (err.message.includes('Cannot read properties of undefined')) {
    return false;
  }
  if (err.message.includes('window is not defined')) {
    return false;
  }
  if (err.message.includes('Failed to fetch dynamically imported module')) {
    return false;
  }
  return true;
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.visit('/logout');
  cy.url().should('include', '/');
});

// Custom command to wait for API calls
Cypress.Commands.add('waitForApi', (method, url, alias) => {
  cy.intercept(method, url).as(alias);
  cy.wait(`@${alias}`);
});

// Custom command to clear localStorage
Cypress.Commands.overwrite('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});

// Custom command to set localStorage
Cypress.Commands.add('setLocalStorage', (key, value) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

// Custom command to get localStorage
Cypress.Commands.add('getLocalStorage', (key) => {
  cy.window().then((win) => {
    return win.localStorage.getItem(key);
  });
});

// Custom command to check if element is visible
Cypress.Commands.add('isVisible', (selector) => {
  cy.get(selector).should('be.visible');
});

// Custom command to check if element is not visible
Cypress.Commands.add('isNotVisible', (selector) => {
  cy.get(selector).should('not.be.visible');
});

// Custom command to wait for loading to complete
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
});

// Custom command to select date from date picker
Cypress.Commands.add('selectDate', (selector, date) => {
  cy.get(selector).click();
  cy.get('.MuiPickersDay-root').contains(date).click();
});

// Custom command to type in MUI text field
Cypress.Commands.add('typeInMuiField', (label, text) => {
  cy.get(`label:contains("${label}")`).parent().find('input').type(text);
});

// Custom command to wait for React to render
Cypress.Commands.add('waitForReact', () => {
  cy.wait(1000); // Simple wait for React to render
});

// Stub console errors and warnings to reduce noise
Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').callsFake(() => {});
  cy.stub(win.console, 'warn').callsFake(() => {});
});
