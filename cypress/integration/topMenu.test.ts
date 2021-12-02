context("Tob menu test", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string

    cy.visit(`${host}#/pools`)
    cy.wait(3000)
  })
  it("render top menu ", () => {
    cy.get("[data-testid=topMenuContainer]").should("be.visible")
  })

  it("open token claim modal", () => {
    cy.get("[data-testid=rewardButton]").should("exist").click()

    cy.get("[data-testid=tknClaimContainer]")
      .should("exist")
      .find("[data-testid=tokenAddBtn]")
      .click()
    cy.get("[data-testid=modalContainer]")
      .should("be.visible")
      .find("[data-testid=modalCloseBtn]")
      .click()
      .should("not.exist")
  })
  it("side menu test", () => {
    cy.get("[data-testid=settingMenuBtn]").click()
    cy.get("[data-testid=settingMenuContainer]").should("be.visible")
    cy.get("[data-testid=networkMenu]")
      .contains("∨")
      .click()
      .contains("∧")
      .click()
      .contains("∨")
    cy.get("[data-testid=languageMenu]")
      .contains("∨")
      .click()
      .contains("∧")
      .click()
      .contains("∨")
  })
})
