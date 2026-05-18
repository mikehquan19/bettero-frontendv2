import { Chart } from 'chart.js';
import type { ArcElement } from 'chart.js';

const transactionCategories = [
  'Income',
  'Housing',
  'Automobile',
  'Medical',
  'Subscription',
  'Grocery',
  'Dining',
  'Shopping',
  'Gas',
];

describe('Home', () => {
  beforeEach('Navigate to page', () => {
    cy.visit('/');
  });

  it('Shows the analytics', () => {
    cy.contains('Spending analysis this month');

    // Click on the pie chart 's slice and expands the table
    cy.window()
      .its('__expenseCompositionChart')
      .should('exist')
      .then((chart: Chart<'pie'>) => {
        // Select 3 random expense categories
        const selectedCategories = transactionCategories
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        cy.log(`3 selected categories: ${selectedCategories.join(', ')}`);

        for (const category of selectedCategories) {
          const labels = chart.data.labels as string[];
          cy.log(labels.join(', '));
          const idx = labels.indexOf(category);

          const element = chart.getDatasetMeta(0).data[idx] as ArcElement;
          const pos = element.tooltipPosition(false);

          cy.dataCy('expense-composition-chart').click(pos.x, pos.y).wait(1500);
          cy.dataCy('category-tran-table')
            .should('be.visible')
            .within(() => {
              cy.dataCy('transaction-row').each(
                (element: JQuery<HTMLElement>) => {
                  cy.wrap(element).contains(category);
                },
              );
            });
        }
      });

    // Close the collapse button to hide the table
    cy.dataCy('collapse-category-tran-btn')
      .should('be.visible')
      .click()
      .wait(1500);
    cy.dataCy('category-tran-table').should('not.be.visible');
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
      cy.log(`Type: ${type}`);

      // Click See details button
      cy.get('[id="See details"]').eq(idx).click().wait(1000);
      cy.url().should('include', `/accounts?type=${type}`);

      // Test if it has been back to the home path
      cy.go('back').wait(1000);
      cy.get('@currentPath').then((path) => {
        cy.url().should('eq', path);
      });
    });
  });

  it('Click the button to open the account form', () => {
    cy.dataCy('add-account-btn').each(
      (element: JQuery<Element>, idx: number) => {
        cy.dataCy('account-form').should('not.exist');

        cy.wrap(element).click().wait(1500);
        cy.dataCy('account-form')
          .should('be.visible')
          .contains(`CREATE ${['DEBIT', 'CREDIT'][idx]} ACCOUNTS`) // Check if the correct form pops up
          .tapOutside();
      },
    );
  });

  it('Fill out the debit account form and submit', () => {
    // Open the debit account form
    cy.dataCy('add-account-btn').first().click();

    // Submit without filling out anything
    cy.get('[type="submit"]').click().wait(1500);
    cy.contains("Can't submit the form due to field-level error");

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
        cy.contains('[role="option"]', value).click();
      } else {
        // Text field
        cy.dataCy(field).type(value);
      }
    });

    /*
    // TODO: Mock the data creation
    cy.get('[type="submit"]').click().wait(2000);

    // Result: Green banner shows up
    cy.contains(`${data['account-name']} created successfully!`);
    cy.get('debit-card')
      .first()
      .within(() => {
        Object.values(data).forEach((value) => {
          cy.contains(value);
        });
      });
    */
  });

  it('Render table of transactions and click menu', () => {
    cy.contains('List of transactions');

    for (let idx = 0; idx < 5; idx++) {
      // Menu is not visible
      cy.get('[id="transaction-actions"]').should('not.exist');

      // Click the actions button and the menu should pop up
      cy.get('[id="see-actions"]').eq(idx).click().wait(1500);
      cy.get('[id="transaction-actions"]').should('be.visible').tapOutside();
    }
  });

  it('Go between pages of table', () => {});

  it('Search for transactions', () => {
    // Type keyword to the search bar
    cy.dataCy('tran-search-bar')
      .should('be.visible')
      .type('payment')
      .wait(1500);

    // Perform actions inside the promise resolving
    cy.get('[role="option"]')
      .should('have.length.gt', 0)
      .first()
      .then((el1: JQuery<HTMLElement>) => {
        const type = el1.find('[id="type"]').text().toLowerCase();
        const value = el1.find('[id="value"]').text();
        cy.log(`Option: ${type}, ${value}`);

        // Choose first option by clicking lookup button
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

  it('Create transaction', () => {
    cy.dataCy('add-transaction-btn').should('be.visible').click();
    cy.dataCy('transaction-form')
      .should('be.visible')
      .contains('CREATE TRANSACTIONS');

    cy.get('[type="submit"]').click();
    cy.contains("Can't submit the form due to field-level error");
    cy.wait(1500);

    cy.dataCy('transaction-form').tapOutside();
  });

  it('Choose update transaction', () => {
    // Click actions button
    cy.get('[id="see-actions"]').first().click().wait(500);

    // Click Update
    cy.contains('Update').click({ force: true });
    cy.dataCy('transaction-form')
      .should('be.visible')
      .contains('UPDATE TRANSACTIONS');

    // Test if the data on form matches row
    const fields = ['merchant', 'description', 'category', 'amount'];
    for (const field of fields) {
      cy.dataCy(field)
        .find('input')
        .invoke('val')
        .then((val) => {
          cy.log(`${field}: ${val}`);
          assert(val !== undefined);
          const str =
            typeof val! === 'string' || typeof val! === 'number'
              ? String(val!)
              : val![0];
          cy.dataCy('transaction-row').first().contains(str);
        });
    }
    cy.wait(1500);

    cy.get('[type="submit"]').click().wait(1500);
    cy.contains('updated successfully!');
  });

  it('Choose delete transaction', () => {
    cy.get('[id="see-actions"]').first().click().wait(500);

    cy.contains('Delete').click({ force: true });
    cy.dataCy('delete-transaction')
      .should('be.visible')
      .wait(1500)
      .tapOutside();
  });
});
