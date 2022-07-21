context("Swap Flow", () => {
  const SUSD_METAPOOL_V3_NAME = "sUSD-USDv2_v3"
  function testAssetSwap(poolName: string, poolTokenSymbols: string[]) {
    describe(`Swapping within ${poolName}`, () => {
      before(() => {
        cy.visit(`/#/`)
        cy.waitForReact()
        cy.get("[data-testid=advOptionContainer]")
          .click()
          .then(() => {
            cy.get("[data-testid=txnDeadlineInputGroup]").within(() => {
              cy.get("input").then(($input) => {
                cy.wrap($input).type("1000")
              })
            })
          })
      })
      beforeEach(() => {
        cy.wait(2000)
      })

      it("starts in a neutral state", () => {
        cy.get('[data-testid="swapTokenInputFrom"]')
          .eq(0)
          .should("include.text", "Choose")
        cy.get('[data-testid="swapTokenInputTo"]')
          .eq(0)
          .should("include.text", "Choose")
      })
      it("shows all of the pool's tokens and balances in dropdown", () => {
        cy.get('[data-testid="swapTokenInputFrom"]')
          .eq(0)
          .contains("Choose")
          .as("dropdownButton")
          .click() // show
        poolTokenSymbols.forEach((tokenSymbol) => {
          cy.react("ListItem", { options: { timeout: 3000 } }).should("exist") // wait for listitem to appear
          cy.get('[data-testid="dropdownContainer"]')
            .contains(tokenSymbol, { matchCase: false })
            .should("exist")
            .should("not.include.text", "≈$0")
        })
        cy.get("@dropdownButton").click() // hide
      })
      it("dropdown shows correct search results", () => {
        cy.get('[data-testid = "listOpenBtn"]').eq(0).click() //Dropdown show

        cy.get('[data-testid="searchTermInput"]')
          .should("be.visible")
          .type(poolTokenSymbols[0])
          .wait(2000)
        cy.get('[data-testid="swapTokenItem"]').should("have.length", 1)
      })
      it("reflects token balance after selecting a token", () => {
        cy.get('[data-testid="dropdownContainer"]')
          .contains(poolTokenSymbols[0], { matchCase: false })
          .click()
        cy.react("SearchSelect", { options: { timeout: 1000 } }).should(
          "not.exist",
        )
        // cy.react("SwapTokenInput")
        //   .eq(0)
        cy.get('[data-testid="swapTokenInputFrom"]').contains(
          poolTokenSymbols[0],
          { matchCase: false },
        )
        cy.get('[data-testid="swapTokenFromWalletBalance"]').should(($el) => {
          expect(parseInt($el.text().replace(",", ""))).to.be.greaterThan(0)
        })
      })
      it("accepts user input and updates calculated amount", () => {
        cy.get('[data-testid="tokenValueInput"]').eq(0).type("1").wait(2000)
        cy.get('[data-testid = "inputValueUSD"]')
          .eq(0)
          .should("not.have.text", "≈$0.0")
      })
      it("allows users to select only tokens in the same pool", () => {
        cy.get('[data-testid="swapTokenInputTo"]')
          .contains("Choose")
          .as("dropdownButton")
          .click() // show
        cy.react("ListItem", { props: { isAvailable: false } }).should(
          "have.length.above",
          0,
        )
        poolTokenSymbols.slice(1).forEach((tokenSymbol, i) => {
          const el = cy.react("ListItem", {
            props: { symbol: tokenSymbol, isAvailable: true },
          })
          el.should("exist")
          el.should("not.include.text", "≈$0")
          if (i === poolTokenSymbols.length - 2) {
            el.click()
          }
        })
        cy.react("SwapTokenInput")
          .eq(1)
          .find("input")
          .as("swapInputEl")
          .should("not.have", "0")
        // cy.get("@swapInputEl").siblings("p").should("not.have.text", "≈$0.0")
        cy.get('[data-testid="inputValueUSD"]').should("not.have.text", "≈$0.0")
      })
      it("shows information about the transaction", () => {
        cy.get("div").contains("Rate").as("rateEl").should("exist")
        cy.get('[data-testid="exchRate"]').should(($el) => {
          expect($el.text()).to.match(/\d+\.\d+/)
        })

        cy.get("div")
          .contains("Price Impact")
          .as("priceImpactEl")
          .should("exist")
        cy.get('[data-testid="swapPriceImpactValue"]').should(($el) => {
          expect($el.text()).to.match(/-?\d+\.\d+%/)
        })
        // cy.get("[data-testid=high-price-impact-confirmation]").click()
      })
      it("allows user to review a swap", () => {
        cy.get("button").contains("Swap").should("be.enabled").click()
      })
      it("completes a swap", () => {
        cy.get("[data-testid=high-price-impact-confirmation]")
          .its("length")
          .then((length) => {
            if (length > 0) {
              cy.get("[data-testid=high-price-impact-confirmation]").click()
            }
          })
        cy.get("button").contains("Confirm Swap").should("be.enabled").click()
      })
    })
  }
  const testConfigs: [string, string[]][] = [
    [SUSD_METAPOOL_V3_NAME, ["SUSD", "DAI", "USDC", "USDT"]],
  ]
  testConfigs.forEach((info) => testAssetSwap(...info))
  // it("successfully completes a deposit of all assets", () => {
  //   // attempt to wait for pool data to load
  //   cy.get("input").first({ timeout: 10000 }).should("be.enabled")
  //   // TODO: assert default state of the page
  //   // fill in first 4 inputs
  //   cy.get("input").each(($input, idx) => {
  //     if (idx > 3) return
  //     cy.wrap($input).type(".0001")
  //   })
  //   // TODO: assert price impact changes
  //   cy.wait(500)
  //   // click "deposit" to trigger review modal
  //   cy.get("button").contains("Deposit").click()
  //   // TODO: assert review data
  //   // click "confirm" to initiate the actual transactions
  //   cy.get("button").contains("Confirm Deposit").click()
  //   // const tokenNames = ["tBTC", "WBTC", "renBTC", "sBTC"]
  //   // tokenNames.forEach((tokenName) => {
  //   //   cy.get(".toast")
  //   //     .contains(`Successfully approved spend for ${tokenName}`)
  //   //     .should("exist")
  //   // })
  //   cy.get(".toast").contains("giddyup", { timeout: 10000 }).should("exist")
  // })
})
