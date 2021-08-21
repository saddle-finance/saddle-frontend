import { PoolName } from "../../src/constants"

// have two seperate maps here since the naming convention is different throughout the page
const poolTokensFullName: { [key: string]: string[] } = {
  "BTC Pool V2": ["WBTC", "renBTC", "sBTC"],
  "Stablecoin Pool V2": ["Dai", "USDC Coin", "Tether"],
}

const poolTokens: { [key: string]: string[] } = {
  "BTC Pool V2": ["WBTC", "RENBTC", "sBTC"],
  "Stablecoin Pool V2": ["DAI", "USDC", "USDT"],
}

const pools = ["BTC Pool V2", "Stablecoin Pool V2"]

context("Withdrawal Flow", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    pools.forEach(basicDeposit)

    cy.visit(`${host}#/pools`)
    cy.wait(5000)
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

    cy.get("#tokenInput input").then(($inputs) => {
      cy.wrap($inputs).each(($input) => {
        cy.wrap($input).type("100")
      })
      cy.wait(500)
      cy.get("button").contains("Deposit").click()
      cy.get("button").contains("Confirm Deposit").click()
    })
  }

  function testPoolWithdraw(poolName: PoolName) {
    it(`successfully completes a withdrawal of all ${poolName} assets`, () => {
      cy.wait(10000)
      cy.contains(poolName)
        .parents(".poolOverview")
        .within(() => {
          cy.get("button").contains("Withdraw").click()
        })

      cy.wait(10000)

      let beforeValue: { [key: string]: number } = {}
      poolTokens[poolName].forEach((token: string) => {
        cy.get(".myShareCard .tokenName")
          .contains(token)
          .parent()
          .find("span.tokenValue")
          .then(($value) => {
            console.log($value)
            beforeValue = {
              ...beforeValue,
              [token]: parseInt($value.text().replace(",", "")),
            }
          })
      })

      // test single item

      const tokens = poolTokensFullName[poolName]
      cy.get(".radio_wrapper .label").contains(tokens[0]).click()
      cy.get("#tokenInput input").first().type("1")
      cy.wait(500)
      cy.get("button").contains("Withdraw").click()
      cy.get("button").contains("Confirm Withdraw").click()
      cy.wait(10000).then(() => {
        cy.get(".myShareCard .tokenName")
          .contains(poolTokens[poolName][0])
          .parent()
          .find("span.tokenValue")
          .then(($value) => {
            const afterValue = parseFloat($value.text().replace(",", ""))
            expect(afterValue).to.lessThan(beforeValue[poolTokens[poolName][0]])
          })
      })

      cy.wait(1000)
      beforeValue = {}
      poolTokens[poolName].forEach((token: string) => {
        cy.get(".myShareCard .tokenName")
          .contains(token)
          .parent()
          .find("span.tokenValue")
          .then(($value) => {
            console.log($value)
            beforeValue = {
              ...beforeValue,
              [token]: parseInt($value.text().replace(",", "")),
            }
          })
      })

      // test combo withdraw through percentage option
      cy.get(".radio_wrapper .label").contains("Combo").click()
      cy.get(".percentage input").first().type("3")
      cy.wait(500)
      cy.get("button").contains("Withdraw").click()
      cy.get("button").contains("Confirm Withdraw").click()
      cy.wait(10000).then(() => {
        poolTokens[poolName].forEach((token: string) => {
          cy.get(".myShareCard .tokenName")
            .contains(token)
            .parent()
            .find("span.tokenValue")
            .then(($value) => {
              const afterValue = parseFloat($value.text().replace(",", ""))
              expect(afterValue).to.lessThan(beforeValue[token])
            })
        })
      })

      cy.wait(1000)
      beforeValue = {}
      poolTokens[poolName].forEach((token: string) => {
        cy.get(".myShareCard .tokenName")
          .contains(token)
          .parent()
          .find("span.tokenValue")
          .then(($value) => {
            console.log($value)
            beforeValue = {
              ...beforeValue,
              [token]: parseInt($value.text().replace(",", "")),
            }
          })
      })

      // test combo withdraw by inputting values
      cy.get(".radio_wrapper .label").contains("Combo").click()
      cy.get("#tokenInput input").then(($inputs) => {
        cy.wrap($inputs).each(($input) => {
          cy.wrap($input).type("2")
          cy.wait(100)
        })
        cy.wait(500)
        cy.get("button").contains("Withdraw").click()
        cy.get("button").contains("Confirm Withdraw").click()
      })
      cy.wait(10000).then(() => {
        poolTokens[poolName].forEach((token: string) => {
          cy.get(".myShareCard .tokenName")
            .contains(token)
            .parent()
            .find("span.tokenValue")
            .then(($value) => {
              const afterValue = parseFloat($value.text().replace(",", ""))
              expect(afterValue).to.lessThan(beforeValue[token])
            })
        })
      })
    })
  }

  pools.forEach(testPoolWithdraw)
})
