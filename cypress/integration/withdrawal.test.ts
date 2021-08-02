import { PoolName } from "../../src/constants"

const poolTokens: { [key: string]: string[] } = {
  "BTC Pool": ["tBTC", "WBTC", "renBTC", "sBTC"],
  "Stablecoin Pool": ["Dai", "USDC Coin", "Tether"],
}
const pools = ["BTC Pool", "Stablecoin Pool"]

context("Withdrawal Flow", () => {
  beforeEach(() => {
    pools.forEach(basicDeposit)
  })

  function basicDeposit(poolName: PoolName) {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.wait(3000)
    // we need a deposit before testing withdrawal
    cy.contains(poolName)
      .parents(".poolOverview")
      .within(() => {
        cy.get("button").contains("Deposit").click()
      })

    cy.wait(3000)

    cy.get(".tokenInput input").then(($inputs) => {
      cy.wrap($inputs).each(($input) => {
        cy.wrap($input).type("100")
      })
      cy.wait(500)
      cy.get("button").contains("Deposit").click()
      cy.get("button").contains("Confirm Deposit").click()
    })
    cy.visit(`${host}#/pools`)
    cy.wait(3000)
  }

  function testPoolWithdraw(poolName: PoolName) {
    it(`successfully completes a withdrawal of all ${poolName} assets`, () => {
      cy.contains(poolName)
        .parents(".poolOverview")
        .within(() => {
          cy.get("button").contains("Withdraw").click()
        })

      cy.wait(3000)

      // test single item
      const tokens = poolTokens[poolName]
      cy.get(".radio_wrapper .label").contains(tokens[0]).click()
      cy.get(".tokenInput input").first().type("1")
      cy.wait(500)
      cy.get("button").contains("Withdraw").click()
      cy.get("button").contains("Confirm Withdraw").click()

      // test combo withdraw through percentage option
      cy.get(".radio_wrapper .label").contains("Combo").click()
      cy.get(".percentage input").first().type("3")
      cy.wait(500)
      cy.get("button").contains("Withdraw").click()
      cy.get("button").contains("Confirm Withdraw").click()

      // test combo withdraw by inputting values
      cy.get(".radio_wrapper .label").contains("Combo").click()
      cy.get(".tokenInput input").then(($inputs) => {
        cy.wrap($inputs).each(($input) => {
          cy.wrap($input).type("2")
          cy.wait(100)
        })
        cy.wait(500)
        cy.get("button").contains("Withdraw").click()
        cy.get("button").contains("Confirm Withdraw").click()
      })
    })
  }

  pools.forEach(testPoolWithdraw)
})
