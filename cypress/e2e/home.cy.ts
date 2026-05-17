describe('Home', () => {
  beforeEach('Navigate to page', () => {
    cy.visit('/');
  });

  it('Shows the analytics', () => {
    cy.contains('Spending analysis this month');

    // Click on the category part of the chart and expands the table
  });

  it('Renders list of accounts', () => {
    // See list of debit cards with no limit and due date
    cy.contains('List of debit accounts');
    cy.dataCy('debit-card')
      .should('have.length.gt', 0)
      .each((element: JQuery<Element>) => {
        cy.wrap(element).within(() => {
          cy.contains('Limit').should('not.exist');
          cy.contains('Next due').should('not.exist');
        });
      });

    // See list of credit cards with limit and due date
    cy.contains('List of credit accounts');
    cy.dataCy('credit-card')
      .should('have.length.gt', 0)
      .each((element: JQuery<Element>) => {
        cy.wrap(element).within(() => {
          cy.contains('Limit');
          cy.contains('Next due');
        });
      });
  });

  it('Click the button to go to account details page', () => {
    cy.url().as('currentPath'); // Save the home path

    ['debit', 'credit'].forEach((type: string, idx: number) => {
      // Click See details button
      cy.get('[id="See details"]').eq(idx).click();
      cy.url().should('include', `/accounts?type=${type}`);
      cy.wait(1000);

      // Test if it has been back to the home path
      cy.go('back');
      cy.get('@currentPath').then((path) => {
        cy.url().should('eq', path);
      });
      cy.wait(1000);
    });
  });

  it('Click the button to open the account form', () => {
    cy.dataCy('add-account-btn').each(
      (element: JQuery<Element>, idx: number) => {
        cy.dataCy('account-form').should('not.exist');

        cy.wrap(element).click();
        cy.dataCy('account-form')
          .should('be.visible')
          .within(() => {
            // Check if the correct form pops up
            cy.contains(`CREATE ${['DEBIT', 'CREDIT'][idx]} ACCOUNTS`);
          })
          .wait(1500)
          .tapOutside();
      },
    );
  });

  it('Fill out the debit account form and submit', () => {
    // Open the debit account form
    cy.dataCy('add-account-btn').first().click();

    // Submit without filling out anything
    cy.get('[type="submit"]').should('be.visible').click();
    cy.contains("Can't submit the form due to field-level error");
    cy.wait(1500);

    // Fill out the form
    const data: Record<string, string> = {
      'account-number': '7777',
      'account-name': 'Test Debit Account 5',
      institution: 'JP Morgan Chase',
      balance: '1000',
    };
    Object.entries(data).forEach(([field, value]) => {
      if (field == 'institution') {
        // Select field
        cy.dataCy(field).click();
        cy.get('[role="listbox"]').should('be.visible');
        cy.contains('[role="option"]', value).click();
      } else {
        // Text field
        cy.dataCy(field).type(value);
      }
    });

    /*
    cy.get('[type="submit"]').should('be.visible').click();
    cy.wait(2000);

    // Result: Green banner shows up
    cy.contains(`${data['account-name']} created successfully!`);
    // First debit card is created one
    cy.get('debit-card')
      .first()
      .within(() => {
        Object.values(data).forEach((value) => {
          cy.contains(value);
        });
      });
    */
  });

  it('Render table of transactions and click menu for each row', () => {
    cy.contains('List of transactions');
    cy.dataCy('transaction-row').should('have.length.gt', 0);

    for (let idx = 0; idx < 3; idx++) {
      // Menu is not visible
      cy.get('[id="transaction-actions"]').should('not.exist');

      // Click the actions button
      cy.get('[id="see-actions"]').eq(idx).click();
      cy.get('[id="transaction-actions"]')
        .should('be.visible')
        .wait(1500)
        .tapOutside();
    }
  });

  it('Search for transactions in the search bar', () => {
    // Type keyword to the search bar
    cy.dataCy('tran-search-bar')
      .should('be.visible')
      .type('payment')
      .wait(1500);

    cy.get('[role="option"]')
      .should('have.length.gt', 0)
      .first()
      .then((el1: JQuery<HTMLElement>) => {
        const type = el1.find('[id="type"]').text().toLowerCase();
        const value = el1.find('[id="value"]').text();
        cy.log(`Option: ${type}, ${value}`);

        // Choose first option
        cy.dataCy('tran-search-btn').click().wait(1500);
        cy.url().should('include', `?${type}=`);
        cy.dataCy('transaction-row').each((el2) => {
          cy.wrap(el2).contains(value);
        });

        // Clear the keyword
        cy.get('[aria-label="Clear"]').click({ force: true }).wait(1500);
        cy.url().should('not.include', `?${type}=`);
      });
  });

  it('Choose update transaction for the first row', () => {
    // Click actions button
    cy.get('[id="see-actions"]').first().click();
    cy.wait(500);

    // Click Update
    cy.contains('Update').click({ force: true });
    cy.dataCy('transaction-form')
      .should('be.visible')
      .within(() => {
        cy.contains('UPDATE TRANSACTIONS');
      });

    // Test if the data on form matches row
    const fields = ['merchant', 'description', 'category', 'amount'];
    for (const field of fields) {
      cy.dataCy(field)
        .find('input')
        .invoke('val')
        .then((val) => {
          assert(val !== undefined);
          const str =
            typeof val! === 'string' || typeof val! === 'number'
              ? String(val!)
              : val![0];
          cy.dataCy('transaction-row').first().contains(str);
          cy.log(`${field}: ${val}`);
        });
    }
    cy.wait(1500);

    cy.dataCy('transaction-form').tapOutside();
  });

  it('Choose delete transaction for the first row', () => {
    cy.get('[id="see-actions"]').first().click();
    cy.wait(500);

    cy.contains('Delete').click({ force: true });
    cy.dataCy('delete-transaction')
      .should('be.visible')
      .wait(1500)
      .tapOutside();
  });
});
