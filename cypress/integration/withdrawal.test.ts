import { PoolName } from "../../src/constants"

// have two seperate maps here since the naming convention is different throughout the page
const poolTokensFullName: { [key: string]: string[] } = {
  "BTC V2": ["WBTC", "renBTC", "sBTC"],
  "Stablecoin V2": ["Dai", "USDC Coin", "Tether"],
}

const pools = ["BTC V2", "Stablecoin V2"]
context("Withdrawal Flow", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    pools.forEach(basicDeposit)

    cy.visit(`${host}#/pools`)
  })

  function basicDeposit(poolName: PoolName) {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    // we need a deposit before testing withdrawal
    cy.contains(poolName)
      .parents("[data-testid=poolOverview]")
      .within(() => {
        cy.get("button").contains("Deposit").click()
      })

    cy.get("#tokenInput input").then(($inputs) => {
      cy.wrap($inputs).each(($input) => {
        cy.wrap($input).type("100")
      })
      cy.get("button").contains("Deposit").click()
      cy.get("button").contains("Confirm Deposit").click()
      cy.visit(`${host}#/pools`)
      cy.get(`[data-testid="${poolName}Balance"]`).contains("$")
    })
  }

  function testPoolWithdraw(poolName: PoolName) {
    it(`successfully completes a withdrawal of all ${poolName} assets`, () => {
      cy.contains(poolName)
        .parents("[data-testid=poolOverview]")
        .within(() => {
          cy.get("button").contains("Withdraw").click()
        })
      // test single item
      const tokens = poolTokensFullName[poolName]
      cy.get('[data-testid="withdrawTokenRadio"]').contains(tokens[0]).click()
      cy.get('[data-testid="myFarmLpBalance"]').should("not.have.text", "0.0")
      cy.wait(10000)
      cy.get("#tokenInput input")
        .first()
        .type("1")
        .type("{backspace}")
        .type("1")
      cy.wait(10000)
      cy.get('[data-testid="withdrawBtn"]').click()
      cy.get("[data-testid=tokenValue]")
        .first()
        .then(($value) => {
          const prevVal = $value.text()
          cy.get("button").contains("Confirm Withdraw").click()
          cy.get("[data-testid=tokenValue]")
            .first()
            .should("not.have.text", prevVal)
        })

      cy.wait(500)
      // test combo withdraw through percentage option
      cy.get('[data-testid="withdrawPercentageCombo"]').click()
      cy.get('[data-testid="withdrawPercentageInput"]')
        .type("3")
        .type("{backspace}")
        .type("1")
      cy.wait(10000)
      cy.get("button").contains("Withdraw").click()
      cy.get("[data-testid=tokenValue]")
        .first()
        .then(($value) => {
          const prevVal = $value.text()
          cy.get("button").contains("Confirm Withdraw").click()
          cy.get("[data-testid=tokenValue]")
            .first()
            .should("not.have.text", prevVal)
        })

      // test combo withdraw by inputting values
      cy.get('[data-testid="withdrawPercentageCombo"]').click()
      cy.get("[data-testid=tokenValue]")
        .first()
        .then(($value) => {
          const prevVal = $value.text()
          cy.get("#tokenInput input").then(($inputs) => {
            cy.get('[data-testid="myFarmLpBalance"]').should(
              "not.have.text",
              "0.0",
            )
            cy.wrap($inputs).each(($input) => {
              cy.wrap($input).type("2")
            })
            cy.get('[data-testid="myFarmLpBalance"]').should(
              "not.have.text",
              "0.0",
            )
            cy.wait(10000)
            cy.get("button").contains("Withdraw").click()
            cy.get("button").contains("Confirm Withdraw").click()
            cy.get("[data-testid=tokenValue]")
              .first()
              .should("not.have.text", prevVal)
          })
        })
    })
  }

  pools.forEach(testPoolWithdraw)
})
