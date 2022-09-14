import { PoolName } from "../../src/constants"

const STABLECOIN_POOL_V2_NAME = "USDv2"
const SUSD_METAPOOL_V3_NAME = "sUSD-USDv2_v3"
const pools = [STABLECOIN_POOL_V2_NAME, SUSD_METAPOOL_V3_NAME] // order is important basepool must have balance prior to metapool
// have two seperate maps here since the naming convention is different throughout the page
const poolTokensSymbols: { [key: string]: string[] } = {
  [SUSD_METAPOOL_V3_NAME]: ["SUSD", "DAI", "USDC", "USDT"],
  [STABLECOIN_POOL_V2_NAME]: ["DAI", "USDC", "USDT"],
}

context("Withdrawal Flow", () => {
  beforeEach(() => {
    cy.visit(`/#/pools`)
    cy.wait(6000)
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function basicDeposit(poolName: PoolName) {
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
      cy.get(".Toastify").contains(`Deposit on ${poolName} complete`)
      cy.visit(`/#/pools`)
      cy.get(`[data-testid="${poolName}Balance"]`).contains("$")
    })
  }

  function testPoolWithdraw(poolName: PoolName) {
    // @dev this runs after deposit flow so is unneeded
    // it(`prepares the ${poolName} pool by adding assets to it`, () => {
    //   basicDeposit(poolName)
    // })
    it(`successfully completes a withdrawal of all ${poolName} assets`, () => {
      cy.contains(poolName)
        .parents("[data-testid=poolOverview]")
        .within(() => {
          cy.get("button").contains("Withdraw").click()
        })
      cy.get("[data-testid=advTableContainer]").then(($tableContainer) => {
        if ($tableContainer.is(":visible")) {
          cy.log("container is visible")
        } else {
          cy.get("[data-testid=advOptionContainer]").click()
        }
      })
      cy.get("[data-testid=txnDeadlineInputGroup]")
        .find("input")
        .type((60 * 60 * 7).toString()) // 1 week for safety
      // test single item
      const tokens = poolTokensSymbols[poolName]
      cy.get('[data-testid="withdrawTokenRadio"]')
        .contains(tokens[0], { matchCase: false })
        .click()
      // cy.get('[data-testid="myFarmLpBalance"]').should("not.have.text", "0.0")
      cy.wait(2500)
      cy.get("#tokenInput input").first().type("1")
      cy.wait(2500)
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

      // test combo withdraw through percentage option
      cy.get('[data-testid="withdrawPercentageCombo"]').click()
      cy.get('[data-testid="withdrawPercentageInput"]').type("3")
      cy.wait(2500)
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
            // cy.get('[data-testid="myFarmLpBalance"]').should(
            //   "not.have.text",
            //   "0.0",
            // )
            cy.wrap($inputs).each(($input) => {
              cy.wrap($input).type("2")
            })
            // cy.get('[data-testid="myFarmLpBalance"]').should(
            //   "not.have.text",
            //   "0.0",
            // )
            cy.wait(2500)
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
