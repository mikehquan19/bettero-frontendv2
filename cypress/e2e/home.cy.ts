describe('Home', () => {
  beforeEach('Navigate to page', () => {
    cy.visit('/');
  });

  it('Shows the analytics', () => {
    cy.contains('Spending analysis this month');
  });

  it('Renders list of accounts', () => {
    cy.contains('List of debit accounts');
    cy.dataCy('debit-card')
      .should('have.length.gt', 0)
      .each((el: JQuery<Element>) => {
        // Debit card shouldn't have limit and due date
        cy.wrap(el).within(() => {
          cy.contains('Limit').should('not.exist');
          cy.contains('Next due').should('not.exist');
        });
      });

    cy.contains('List of credit accounts');
    cy.dataCy('credit-card')
      .should('have.length.gt', 0)
      .each((el: JQuery<Element>) => {
        cy.wrap(el).within(() => {
          // Credit card should show limit and due date
          cy.contains('Limit');
          cy.contains('Next due');
        });
      });
  });

  it('Click the button to go to account details page', () => {
    ['debit', 'credit'].forEach((type: string, idx: number) => {
      cy.url().as('homePath');
      cy.get('[id="See details').eq(idx).click();
      cy.url().should('include', `/accounts?type=${type}`);
      cy.wait(2000);

      // Test if it has been back to the home path
      cy.go('back');
      cy.get('@homePath').then((path) => {
        cy.url().should('eq', path);
      });
      cy.wait(2000);
    });
  });

  it('Click the button to open the account form', () => {
    // There are 2 buttons, click each one
    // and check if form is correct
    cy.dataCy('add-account-btn').each((el: JQuery<Element>, idx: number) => {
      cy.dataCy('account-form').should('not.exist');

      cy.wrap(el).click();
      cy.dataCy('account-form')
        .should('be.visible')
        .within(() => {
          const type = idx == 0 ? 'DEBIT' : 'CREDIT';
          cy.contains(`CREATE ${type} ACCOUNTS`);
        });
      cy.wait(2000);

      // Tap anywhere to close it
      cy.get('body').click(0, 0);
      cy.wait(1000);
    });
  });

  it('Render table of transactions', () => {
    cy.contains('List of transactions');
    cy.dataCy('transaction-row').should('have.length.gt', 0);

    // Only check the first 3 instead of all rows
    for (let i = 0; i < 3; i++) {
      cy.get('[id="transaction-actions"]').should('not.exist');
      cy.dataCy('transaction-row')
        .eq(i)
        .within(() => {
          cy.get('[id="see-actions"]').click();
        });
      cy.get('[id="transaction-actions"]').should('be.visible');
      cy.wait(1000);

      cy.get('body').click(0, 0);
      cy.wait(1000);
    }
  });

  it('Choose update transaction', () => {
    cy.dataCy('transaction-row')
      .eq(0)
      .within(() => {
        cy.get('[id="see-actions"]').click();
      });
    cy.wait(500);

    cy.contains('Update').click({ force: true });
    cy.dataCy('transaction-form').should('be.visible');

    // TODO: Check if the data rendered on the form is same as table


    cy.wait(1500);

    cy.get('body').click(0, 0);

  });

  it('Choose delete transaction', () => {
    cy.dataCy('transaction-row')
      .eq(0)
      .within(() => {
        cy.get('[id="see-actions"]').click();
      });
    cy.wait(500);

    cy.contains('Delete').click({ force: true });
    cy.contains('DELETE TRANSACTION');
    cy.wait(1500);

    cy.get('body').click(0, 0);
  });
});
