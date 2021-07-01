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
      // Get current value of total amount
      cy.get(".infoItem")
        .contains("Total amount:")
        .parent()
        .find("span.value")
        .then(($span) => {
          const currentTotalAmount = parseInt($span.text())
          // TODO: assert default total amount
          // expect(currentTotalAmount).to.eq(defaultTotalAmount)

          // Get the number of token inputs
          cy.get(".tokenInput input").then(($inputs) => {
            const numOfTokens = $inputs.length
            cy.wrap($inputs).each(($input) => {
              cy.wrap($input).type("1")
            })
            // TODO: assert price impact changes
            cy.wait(500)
            // click "deposit" to trigger review modal
            cy.get("button").contains("Deposit").click()
            // TODO: assert review data
            // click "confirm" to initiate the actual transactions
            cy.get("button").contains("Confirm Deposit").click()
            // Wait and assert the total amount has been increased by numOfTokens
            cy.wait(7000).then(() => {
              const newTotalAmount = parseInt($span.text())
              expect(newTotalAmount).to.eq(currentTotalAmount + numOfTokens)
            })
            // const tokenNames = ["tBTC", "WBTC", "renBTC", "sBTC"]
            // tokenNames.forEach((tokenName) => {
            //   cy.get(".toast")
            //     .contains(`Successfully approved spend for ${tokenName}`)
            //     .should("exist")
            // })
          })
        })
    })
  }
  ;["BTC", "Stablecoin"].forEach(testPoolDeposit)
})
