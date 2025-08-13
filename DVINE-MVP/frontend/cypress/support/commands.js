// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command to wait for page load
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
});

// Custom command to check if element exists
Cypress.Commands.add('elementExists', (selector) => {
  cy.get(selector).should('exist');
});

// Custom command to check if element does not exist
Cypress.Commands.add('elementNotExists', (selector) => {
  cy.get(selector).should('not.exist');
});

// Custom command to click element if it exists
Cypress.Commands.add('clickIfExists', (selector) => {
  cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector).click();
    }
  });
});

// Custom command to type in field if it exists
Cypress.Commands.add('typeIfExists', (selector, text) => {
  cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0) {
      cy.get(selector).type(text);
    }
  });
});

// Custom command to wait for element to be visible
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Custom command to wait for element to not be visible
Cypress.Commands.add('waitForElementToDisappear', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('not.be.visible');
});

// Custom command to scroll to element
Cypress.Commands.add('scrollToElement', (selector) => {
  cy.get(selector).scrollIntoView();
});

// Custom command to check URL
Cypress.Commands.add('checkUrl', (expectedUrl) => {
  cy.url().should('include', expectedUrl);
});

// Custom command to check page title
Cypress.Commands.add('checkPageTitle', (expectedTitle) => {
  cy.title().should('include', expectedTitle);
});

// Custom command to wait for network requests to complete
Cypress.Commands.add('waitForNetworkIdle', (timeout = 5000) => {
  cy.wait(timeout);
});

// Custom command to take screenshot
Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name);
});

// Custom command to check if user is authenticated
Cypress.Commands.add('checkAuthStatus', () => {
  cy.window().then((win) => {
    const token = win.localStorage.getItem('accessToken');
    return token ? true : false;
  });
});

// Custom command to clear all storage
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// Custom command to wait for API response
Cypress.Commands.add('waitForApiResponse', (alias, timeout = 10000) => {
  cy.wait(`@${alias}`, { timeout });
});

// Custom command to mock API response
Cypress.Commands.add('mockApiResponse', (method, url, response, statusCode = 200) => {
  cy.intercept(method, url, {
    statusCode,
    body: response
  }).as(`${method.toLowerCase()}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`);
});

// Custom command to check if element has text
Cypress.Commands.add('hasText', (selector, text) => {
  cy.get(selector).should('contain.text', text);
});

// Custom command to check if element does not have text
Cypress.Commands.add('doesNotHaveText', (selector, text) => {
  cy.get(selector).should('not.contain.text', text);
});

// Custom command to check if element has value
Cypress.Commands.add('hasValue', (selector, value) => {
  cy.get(selector).should('have.value', value);
});

// Custom command to check if element is disabled
Cypress.Commands.add('isDisabled', (selector) => {
  cy.get(selector).should('be.disabled');
});

// Custom command to check if element is enabled
Cypress.Commands.add('isEnabled', (selector) => {
  cy.get(selector).should('not.be.disabled');
});

// Custom command to check if element is checked
Cypress.Commands.add('isChecked', (selector) => {
  cy.get(selector).should('be.checked');
});

// Custom command to check if element is not checked
Cypress.Commands.add('isNotChecked', (selector) => {
  cy.get(selector).should('not.be.checked');
});

// Custom command to select option from dropdown
Cypress.Commands.add('selectOption', (selector, option) => {
  cy.get(selector).select(option);
});

// Custom command to check if element has class
Cypress.Commands.add('hasClass', (selector, className) => {
  cy.get(selector).should('have.class', className);
});

// Custom command to check if element does not have class
Cypress.Commands.add('doesNotHaveClass', (selector, className) => {
  cy.get(selector).should('not.have.class', className);
});

// Custom command to check if element has attribute
Cypress.Commands.add('hasAttribute', (selector, attribute, value) => {
  cy.get(selector).should('have.attr', attribute, value);
});

// Custom command to check if element does not have attribute
Cypress.Commands.add('doesNotHaveAttribute', (selector, attribute) => {
  cy.get(selector).should('not.have.attr', attribute);
});

// Custom command to wait for element to have text
Cypress.Commands.add('waitForText', (selector, text, timeout = 10000) => {
  cy.get(selector, { timeout }).should('contain.text', text);
});

// Custom command to wait for element to not have text
Cypress.Commands.add('waitForTextToDisappear', (selector, text, timeout = 10000) => {
  cy.get(selector, { timeout }).should('not.contain.text', text);
});

// Custom command to check if element is focused
Cypress.Commands.add('isFocused', (selector) => {
  cy.get(selector).should('be.focused');
});

// Custom command to check if element is not focused
Cypress.Commands.add('isNotFocused', (selector) => {
  cy.get(selector).should('not.be.focused');
});

// Custom command to press key
Cypress.Commands.add('pressKey', (key) => {
  cy.get('body').type(`{${key}}`);
});

// Custom command to press key on element
Cypress.Commands.add('pressKeyOnElement', (selector, key) => {
  cy.get(selector).type(`{${key}}`);
});

// Custom command to check if element is in viewport
Cypress.Commands.add('isInViewport', (selector) => {
  cy.get(selector).should('be.visible');
});

// Custom command to check if element is not in viewport
Cypress.Commands.add('isNotInViewport', (selector) => {
  cy.get(selector).should('not.be.visible');
});
