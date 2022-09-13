import { JsonRpcProvider } from "@ethersproject/providers"
import { getDefaultProvider } from "ethers"

const STABLECOIN_POOL_V2_NAME = "USDv2"
const SUSD_METAPOOL_V3_NAME = "sUSD-USDv2_v3"
const pools = [STABLECOIN_POOL_V2_NAME, SUSD_METAPOOL_V3_NAME] // order is important basepool must have balance prior to metapool

async function increaseTime() {
  const provider = getDefaultProvider(
    Cypress.env("PROVIDER_HOST") as string,
  ) as JsonRpcProvider
  // move block time forward +10 minutes
  // this is necessary since metapools have a 10 minute cache of base pool virtualPrice
  return new Cypress.Promise((resolve) => {
    void provider
      .send("evm_increaseTime", [600]) // +10 minutes
      .then(() => provider.send("evm_mine", []))
      .then(resolve)
  })
}
context("Deposit Flow", () => {
  beforeEach(() => {
    cy.visit(`/#/pools`)
    cy.wait(6000)
  })

  function testPoolDeposit(poolName: string) {
    if (poolName === SUSD_METAPOOL_V3_NAME) {
      void increaseTime()
    }
    it(`successfully completes a deposit of all ${poolName} assets`, () => {
      cy.contains(new RegExp("^" + poolName + "$"))
        .parents("[data-testid=poolOverview]")
        .within(() => {
          cy.get("button").contains("Deposit").click()
        })
      if (poolName === SUSD_METAPOOL_V3_NAME) {
        cy.get("[data-testid=deposit-wrapped-checkbox]").click()
      }
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
      cy.get("#tokenInput input").then(($inputs) => {
        cy.wrap($inputs).each(($input) => {
          cy.wrap($input).type("100")
          cy.wait(50)
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
