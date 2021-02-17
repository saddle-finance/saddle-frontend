context("Deposit Flow", () => {
  before(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/deposit`)
    cy.wait(10000)
  })
  it("successfully completes a deposit of all assets", () => {
    // attempt to wait for pool data to load
    cy.get("input").first({ timeout: 10000 }).should("be.enabled")
    // TODO: assert default state of the page
    // fill in first 4 inputs
    cy.get("input").each(($input, idx) => {
      if (idx > 3) return
      cy.wrap($input).type(".0001")
    })
    // TODO: assert price impact changes
    cy.wait(500)
    // click "deposit" to trigger review modal
    cy.get("button").contains("Deposit").click()
    // TODO: assert review data
    // click "confirm" to initiate the actual transactions
    cy.get("button").contains("Confirm Deposit").click()
    // const tokenNames = ["tBTC", "WBTC", "renBTC", "sBTC"]
    // tokenNames.forEach((tokenName) => {
    //   cy.get(".toast")
    //     .contains(`Successfully approved spend for ${tokenName}`)
    //     .should("exist")
    // })
    cy.get(".toast").contains("giddyup", { timeout: 10000 }).should("exist")
  })
})
