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

    cy.get(".advancedOptions>span").should("exist")
    cy.get(".advancedOptions").then((advancedOptions) => {
      if (advancedOptions.find(".tableContainer").length > 0) {
        const isShow = advancedOptions.find(".tableContainer").hasClass("show")
        if (!isShow) {
          cy.get(".title").click()
        }
        cy.get(".infiniteApproval")
          .find('[name="checkbox"]')
          .check({ force: true })
        cy.get(".inputGroup").each(($inputGrop, index) => {
          cy.wrap($inputGrop)
            .find(".options")
            .find("button")
            .each(($button) => {
              cy.wrap($button).click().should("have.class", "selected")
            })
          cy.wrap($inputGrop)
            .find("input")
            .type(advancedOptionValues[index])
            .should("have.value", advancedOptionValues[index])
        })
      } else {
        cy.log("There is no table container")
      }
    })
  }
  it("input slipage value", () => {
    pools.forEach(advancedOptionTest)
  })
})
