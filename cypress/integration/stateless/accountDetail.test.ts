context("Account detail test", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/`)
    cy.waitForReact()
    cy.wait(3000)
  })

  it("renders account detail after click account avatar", () => {
    cy.get("[data-testid=walletStatusContainer]").should("exist")
    cy.get("[data-testid=accountDetailButton]").should("exist").click()
    cy.get("[data-testid=accountDetailContainer]").should("exist")
    cy.get("[data-testid=changeAccountBtn]").click()
    cy.get("[data-testid=connectWalletContainer]").should("exist")
  })
})
