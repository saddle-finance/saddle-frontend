context("Top menu test", () => {
  before(() => {
    cy.visit(`/#/pools`)
    cy.waitForReact()
    cy.wait(2000)
  })

  it("render top menu", () => {
    cy.get("[data-testid=topMenuContainer]").should("be.visible")
  })

  it("open token claim dialog", () => {
    cy.get("[data-testid=rewardButton]").should("exist").click()

    cy.get("[data-testid=tknClaimContainer]")
      .should("exist")
      .find("[data-testid=tokenAddBtn]")
      .click()
    // cy.get("[data-testid=claimsListContainer]").find("Button").first().click()
    cy.get("[data-testid=tokenClaimDialog]")
      .should("be.visible")
      .find("[data-testid=dialogCloseBtn]")
      .click()
      .should("not.exist")
  })

  it("side menu test", () => {
    cy.get("[data-testid=settingsMenuBtn]").click()
    cy.get("[data-testid=settingsMenuContainer]").should("be.visible")

    cy.get("[data-testid=languageMenu]").should("be.visible").click()
    cy.get("[data-testid=languageMenuContainer]")
      .should("be.visible")
      .children()
      .contains("简体中文")
      .click()
    cy.get("[data-testid=swapNavLink]").contains("兑换")
    cy.get("[data-testid=settingsMenuContainer]")
      .children()
      .contains("English")
      .click()
    cy.get("[data-testid=swapNavLink]").contains("Swap")
    cy.get("[data-testid=languageMenu]").should("be.visible")
  })
})
