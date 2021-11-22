import { PoolName } from "../../src/constants"

context("Advanced option test", () => {
  // have two seperate maps here since the naming convention is different throughout the page
  const pools = ["BTC Pool V2", "Stablecoin Pool V2"]

  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.waitForReact()
    cy.wait(3000)
  })

  function advancedOptionTest(poolName: PoolName) {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.wait(3000)
    cy.contains(poolName)
      .parents(".poolOverview")
      .within(() => {
        cy.get("button").contains("Withdraw").click()
      })
    cy.wait(10000)

    cy.get(".advancedOptions>span").should("exist")
  }
  it("input slipage value", () => {
    pools.forEach(advancedOptionTest)
  })
})
