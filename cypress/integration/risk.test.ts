context("Risk Flow", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/risk`)
  })

  it("renders the Risk view and its contents", () => {
    cy.get('[data-cy="risk-intro"]').contains("Providing liquidity to Saddle")
    cy.get('[data-cy="risk-audits"]').contains("The Saddle smart")
    cy.get('[data-cy="risk-adminkeys"]').contains("Saddle's admin keys")
    cy.get('[data-cy="risk-lossofpeg"]').contains("If one of the assets")
  })
})
