import { PoolName } from "../../src/constants"

context("Advanced option test", () => {
  // have two seperate maps here since the naming convention is different throughout the page
  const pools = ["BTC Pool V2", "Stablecoin Pool V2"]
  const advancedOptionValues = ["0.1", "20", "20"]

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

    cy.get("[data-testid=optionContainer]").should("exist")
    cy.get("[data-testid=optionContainer]").then((advancedOptions) => {
      if (advancedOptions.find("[dat-testid=tableContainer]").length > 0) {
        cy.get("[dat-testid=tableContainer]").then(($table) => {
          const tableDisplay = $table.css("display")
          const isTableVisible = tableDisplay !== "none"

          if (!isTableVisible) {
            cy.get("[data-testid=title]").click()
          }
        })
        cy.get("[data-testid=infiniteApproval]")
          .find('[type="checkbox"]')
          .check({ force: true })

        cy.get("[data-testid=inputGroup]").each(($inputGrop, index) => {
          const display = $inputGrop.parent().css("display")

          if (display !== "none") {
            cy.wrap($inputGrop)
              .find("button")
              .each(($button) => {
                cy.wrap($button)
                  .click()
                  .then(($afterClick) => {
                    const buttonClass = $afterClick.attr("class")
                    expect(buttonClass).to.match(/selected/)
                  })
              })
            cy.wrap($inputGrop)
              .find("input")
              .type(advancedOptionValues[index])
              .should("have.value", advancedOptionValues[index])
          } else {
            cy.log("input group is invisibel")
          }
        })
      } else {
        cy.log("There is no table container")
      }
    })
  }
  it("input slippage value", () => {
    pools.forEach(advancedOptionTest)
  })
})
