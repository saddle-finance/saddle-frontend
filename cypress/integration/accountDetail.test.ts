context("Account detail test", () => {
  beforeEach(() => {
    cy.visit(`/#/`).waitForReact(2000)
  })

  it("renders account detail after click account avatar", () => {
    cy.get("[data-testid=walletStatusContainer]").should("exist")
    cy.get("[data-testid=accountDetailButton]").should("exist").click()
    cy.get("[data-testid=accountDetailContainer]").should("exist")
    cy.get("[data-testid=changeAccountBtn]").click()
    cy.get("[data-testid=connectWalletContainer]").should("exist")
  })
})
