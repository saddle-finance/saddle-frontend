context("Swap Flow", () => {
  function testAssetSwap(poolName: string, poolTokenSymbols: string[]) {
    describe(`Swapping within ${poolName}`, () => {
      before(() => {
        const host = Cypress.env("DAPP_HOST") as string
        cy.visit(`${host}#/`)
        cy.waitForReact()
        cy.wait(3000)
      })
      it("starts in a neutral state", () => {
        cy.react("SwapInput").eq(0).should("include.text", "Choose Token")
        cy.react("SwapInput").eq(1).should("include.text", "Choose Token")
      })
      it("shows all of the pool's tokens and balances in dropdown", () => {
        cy.react("SwapInput")
          .eq(0)
          .contains("Choose Token")
          .as("dropdownButton")
          .click() // show
        poolTokenSymbols.forEach((tokenSymbol) => {
          const el = cy.react("ListItem", { props: { symbol: tokenSymbol } })
          el.should("exist")
          el.should("not.include.text", "≈$0")
        })
        cy.get("@dropdownButton").click() // hide
      })
      it("dropdown shows correct search results", () => {
        cy.react("SwapInput")
          .eq(0)
          .contains("Choose Token")
          .as("dropdownButton")
          .click() // show
        cy.react("SearchSelect").eq(0).find("input").type(poolTokenSymbols[0])
        cy.react("ListItem").should("have.length", 1)
      })
      it("reflects token balance after selecting a token", () => {
        cy.react("ListItem").contains(poolTokenSymbols[0]).click()
        cy.react("SearchSelect").should("not.exist")
        cy.react("SwapInput").eq(0).should("include.text", poolTokenSymbols[0])
        cy.contains("Balance:").siblings("a").should("not.have", "0.0")
      })
      it("accepts user input and updates calculated amount", () => {
        cy.react("SwapInput").eq(0).find("input").as("swapInputEl").type("1")
        cy.get("@swapInputEl").siblings("p").should("not.have.text", "≈$0.0")
      })
      it("allows users to select only tokens in the same pool", () => {
        cy.react("SwapInput")
          .eq(1)
          .contains("Choose Token")
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
        cy.react("SwapInput")
          .eq(1)
          .find("input")
          .as("swapInputEl")
          .should("not.have", "0")
        cy.get("@swapInputEl").siblings("p").should("not.have.text", "≈$0.0")
      })
      it("shows information about the transaction", () => {
        cy.get("div").contains("Rate").as("rateEl").should("exist")
        cy.get("@rateEl")
          .parent()
          .siblings(".exchRate")
          .should(($el) => {
            expect($el.text()).to.match(/\d+\.\d+/)
          })

        cy.get("div")
          .contains("Price Impact")
          .as("priceImpactEl")
          .should("exist")
        cy.get("@priceImpactEl")
          .siblings("span")
          .should(($el) => {
            expect($el.text()).to.match(/-?\d+\.\d+%/)
          })
      })
      it("completes a swap", () => {
        cy.get("button").contains("Swap").click()
      })
    })
  }
  const testConfigs: [string, string[]][] = [
    ["USD Pool", ["DAI", "USDC", "USDT"]],
    ["BTC Pool", ["TBTC", "sBTC", "WBTC", "RENBTC"]],
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
