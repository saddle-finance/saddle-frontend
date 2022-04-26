import { PoolName } from "../../src/constants"

const pools = ["BTC V2", "Stablecoin V2"]

context("Deposit Flow", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.wait(3000)
  })

  function testPoolDeposit(poolName: PoolName) {
    it(`successfully completes a deposit of all ${poolName} assets`, () => {
      cy.contains(poolName)
        .parents("[data-testid=poolOverview]")
        .within(() => {
          cy.get("button").contains("Deposit").click()
        })
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

  pools.forEach(testPoolDeposit)
})
