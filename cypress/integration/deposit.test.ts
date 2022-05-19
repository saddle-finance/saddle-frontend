// const STABLECOIN_POOL_V2_NAME = "Stablecoin V2"
const SUSD_METAPOOL_V3_NAME = "sUSD-USDv2_v3"
// const pools = [STABLECOIN_POOL_V2_NAME, SUSD_METAPOOL_V3_NAME] // order is important basepool must have balance prior to metapool

context("Deposit Flow", () => {
  beforeEach(() => {
    cy.visit(`/#/pools`)
    cy.wait(3000)
  })

  function testPoolDeposit(poolName: string) {
    it(`successfully completes a deposit of all ${poolName} assets`, () => {
      cy.contains(poolName)
        .parents("[data-testid=poolOverview]")
        .within(() => {
          cy.get("button").contains("Deposit").click()
        })
      if (poolName === SUSD_METAPOOL_V3_NAME) {
        cy.get("[data-testid=deposit-wrapped-checkbox]").click()
      }
      cy.get("#tokenInput input").then(($inputs) => {
        cy.wrap($inputs).each(($input) => {
          cy.wrap($input).type("100")
        })
      })
      cy.get("[data-testid=tokenValue]")
        .first()
        .then(($value) => {
          const prevVal = $value.text()
          cy.get("button").contains("Deposit").first().click()
          cy.get("button").contains("Confirm Deposit").click()
          cy.get(".Toastify").contains(`Deposit on ${poolName} complete`)
          cy.get("[data-testid=tokenValue]")
            .first()
            .should("not.have.text", prevVal)
        })
    })
  }

  ;[SUSD_METAPOOL_V3_NAME].forEach(testPoolDeposit)
})
