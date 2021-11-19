context("Account detail test", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/`)
    cy.waitForReact()
    cy.wait(3000)
  })

  it("renders account detail after click account avatar", () => {
    cy.get(".walletStatus").should("exist")
    cy.get(".walletStatus>button").click()
    cy.get(".accountDetail").should("exist")
    cy.get(".buttonGroup>button").contains("Change Account").click()
    cy.get(".modal").should("exist")
  })
})
