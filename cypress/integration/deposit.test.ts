import { JsonRpcProvider } from "@ethersproject/providers"
import { getDefaultProvider } from "ethers"

const STABLECOIN_POOL_V2_NAME = "USDv2"
const SUSD_METAPOOL_V3_NAME = "sUSD-USDv2_v3"
const pools = [STABLECOIN_POOL_V2_NAME, SUSD_METAPOOL_V3_NAME] // order is important basepool must have balance prior to metapool

async function increaseTime() {
  const provider = getDefaultProvider(
    Cypress.env("PROVIDER_HOST"),
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
    cy.waitForReact()
  })

  afterEach(() => {
    cy.wait(2000)
  })

  pools.forEach(testPoolDeposit)
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

    cy.wait(2000)

    cy.get("[data-testid=advOptionContainer]")
      .click()
      .then(() => {
        cy.get("[data-testid=txnDeadlineInputGroup]").within(() => {
          cy.get("input").then(($input) => {
            cy.wrap($input).type("1000")
          })
        })
      })

    cy.wait(2000)

    cy.get("#tokenInput input")
      .then(($inputs) => {
        cy.waitForReact(2000)
        cy.wrap($inputs).each((_, $index) => {
          cy.get(`[data-testid=token-input-${$index}]`).click().type("100")
        })
      })
      .wait(2000)
      .get("[data-testid=tokenValue]")
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
