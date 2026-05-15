describe('Home', () => {
  beforeEach('Navigate to page', () => {
    cy.visit('/');
  });

  it('Shows the analytics', () => {
    cy.contains('Spending analysis this month');
  });

  it('Shows list of accounts', () => {
    cy.contains('List of debit accounts');
    cy.contains('List of credit accounts');
  });

  it('Shows list of transactions', () => {
    cy.contains('List of transactions');
  });
});