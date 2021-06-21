context("Deposit Flow", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.wait(3000)
  })
  function testPoolDeposit(poolName: string) {
    it(`successfully completes a deposit of all ${poolName} assets`, () => {
      cy.contains(poolName)
        .parents(".poolOverview")
        .within(() => {
          cy.get("button").contains("Deposit").click()
        })
      // attempt to wait for pool data to load
      cy.get("input").first({ timeout: 10000 }).should("be.enabled")
      // TODO: assert default state of the page
      cy.get(".tokenInput input").each(($input) => {
        cy.wrap($input).type("1")
      })
      // TODO: assert price impact changes
      cy.wait(500)
      // click "deposit" to trigger review modal
      cy.get("button").contains("Deposit").click()
      // TODO: assert review data
      // click "confirm" to initiate the actual transactions
      cy.get("button").contains("Confirm Deposit").click()
      cy.wait(7000)
      // const tokenNames = ["tBTC", "WBTC", "renBTC", "sBTC"]
      // tokenNames.forEach((tokenName) => {
      //   cy.get(".toast")
      //     .contains(`Successfully approved spend for ${tokenName}`)
      //     .should("exist")
      // })
      cy.contains("giddyup", { timeout: 10000 }).should("exist")
    })
  }
  ;["BTC", "Stablecoin"].forEach(testPoolDeposit)
})
