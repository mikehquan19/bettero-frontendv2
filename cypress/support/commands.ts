/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /** Get the component with the cypress tag */
      dataCy(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Tap at random place outside the pop-up component and wait for 1 second.
       * Used as a chain following the the another command
       */
      tapOutside(): Chainable<void>;
    }
  }
}

// Get the component with the cypress tag
Cypress.Commands.add('dataCy', (selector: string, options) => {
  return cy.get(`[data-cy="${selector}"]`, options);
});

// Tap at random place outside the pop-up component and wait for 1 second
Cypress.Commands.add(
  'tapOutside',
  { prevSubject: 'element' },
  (subject: Cypress.JQueryWithSelector<HTMLElement>) => {
    cy.wrap(subject).then((element) => {
      // Get component's bounds
      const component = element[0].getBoundingClientRect();

      cy.window().then((window) => {
        // Get viewport's bound
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Default values, just click at the top left corner
        let randX = 0;
        let randY = 0;
        // After 100 attempts, if it's still in, then just tap at corner
        for (let idx = 0; idx < 100; idx++) {
          randX = Math.floor(Math.random() * w);
          randY = Math.floor(Math.random() * h);

          const insideComponent =
            randX >= component.left &&
            randX <= component.right &&
            randY >= component.top &&
            randY <= component.bottom;

          if (!insideComponent) {
            break;
          }
        }
        cy.log(`Tap at (${randX}, ${randY})`);
        cy.get('body').click(randX, randY);
      });
    });
    cy.wait(1000);
  },
);

export {};
