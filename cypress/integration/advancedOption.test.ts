import { PoolName } from "../../src/constants"

context("Advanced option test", () => {
  // have two seperate maps here since the naming convention is different throughout the page
  const pools = ["BTC Pool V2", "Stablecoin Pool V2"]

  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.waitForReact()
    cy.wait(3000)
  })

  function advancedOptionTest(poolName: PoolName) {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/pools`)
    cy.wait(3000)
    cy.contains(poolName)
      .parents(".poolOverview")
      .within(() => {
        cy.get("button").contains("Withdraw").click()
      })
    cy.wait(10000)

    cy.get("[data-testid=advOptionContainer]").should("exist")
    cy.get("[data-testid=advTableContainer]").then(($table) => {
      const tableDisplay = $table.css("display")
      const isTableVisible = tableDisplay !== "none"

      if (!isTableVisible) {
        cy.get("[data-testid=advOptionTitle]").click()
      }
    })
    cy.get("[data-testid=infiniteApprovalContainer]")
      .find("input")
      .check({ force: true })
    cy.get("[data-testid=maxSlippageInputGroup]")
      .find("button")
      .each(($button) => {
        cy.wrap($button)
          .click()
          .then(($clickedButton) => {
            const buttonClass = $clickedButton.attr("class")
            expect(buttonClass).to.match(/selected/)
          })
      })
    cy.get("[data-testid=maxSlippageInputGroup]")
      .find("input")
      .type("0.1")
      .should("have.value", "0.1")
    cy.get("[data-testid=txnDeadlineInputGroup]")
      .find("button")
      .each(($button) => {
        cy.wrap($button)
          .click()
          .then(($clickedButton) => {
            const buttonClass = $clickedButton.attr("class")
            expect(buttonClass).to.match(/selected/)
          })
      })
    cy.get("[data-testid=txnDeadlineInputGroup]")
      .find("input")
      .type("20")
      .should("have.value", "20")
  }
  it("input slippage value", () => {
    pools.forEach(advancedOptionTest)
  })
})
