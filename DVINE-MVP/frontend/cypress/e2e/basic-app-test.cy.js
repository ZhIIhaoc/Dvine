describe('Basic Application Test', () => {
  it('should load the application', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
    cy.title().should('not.be.empty');
  });

  it('should load the login page', () => {
    cy.visit('/login');
    cy.get('body').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should find login form elements', () => {
    cy.visit('/login');
    cy.get('body').should('be.visible');
    
    // Wait a bit for React to render
    cy.wait(2000);
    
    // Check if the form elements exist
    cy.get('input[type="email"], input[placeholder*="email"], [data-testid="email-input"]').should('exist');
    cy.get('input[type="password"], [data-testid="password-input"]').should('exist');
    cy.get('button:contains("Log in"), [data-testid="login-button"]').should('exist');
  });
});
