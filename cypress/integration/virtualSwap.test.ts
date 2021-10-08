import { JsonRpcProvider, getDefaultProvider } from "@ethersproject/providers"
type TestConfig = {
  type: string
  from: string
  to: string
}
/**
 * DEV: Right now we aren't able to check for IS_VIRTUAL_SWAP_ACTIVE
 * so you'll have to enable this test manually until virtual swap is turned on (on backend too)
 */
context("Virtual Swap Flow", { env: { NETWORK_ID: 1 } }, () => {
  const testConfigs: TestConfig[] = [
    {
      type: "synthToToken",
      from: "sBTC",
      to: "alETH",
    },
    {
      type: "tokenToToken",
      from: "WBTC",
      to: "WETH",
    },
    {
      type: "tokenToSynth",
      from: "USDC",
      to: "sBTC",
    },
  ]
  function testVirtualSwap({ type, from, to }: TestConfig, runNumber: number) {
    describe(`${type} Swap`, () => {
      let swapRouteLength
      before(() => {
        const host = Cypress.env("DAPP_HOST") as string
        cy.visit(`${host}#/`)
        cy.waitForReact()
        cy.wait(3000)
      })
      // initial swap interface
      it("shows pairs for direct and virtual swaps", () => {
        // show "from" token options
        cy.react("SwapInput")
          .eq(0)
          .contains("Choose Token")
          .as("dropdownButton")
          .click()
        // click our chosen from token
        cy.react("ListItem").contains(from).click()
        // show "to" token options
        cy.react("SwapInput")
          .eq(1)
          .contains("Choose Token")
          .as("dropdownButton")
          .click()
        cy.react("ListItem", { props: { isAvailable: true } })
          .contains("Virtual Swap")
          .should("have.length.above", 0)
        // click our chosen to token
        cy.react("ListItem").contains(to).click()
      })
      it("accepts user input and updates calculated amount", () => {
        cy.react("SwapInput").eq(0).find("input").as("swapInputEl").type("1")
        cy.get("@swapInputEl").siblings("p").should("not.have.text", "≈$0.0")
      })
      it("informs the user of the route and virtual swap", () => {
        cy.get(".swapForm > .row") // get rows
          .eq(-1) // get last row
          .find("span")
          .eq(1)
          .should("contain.text", "Virtual Swap")
        cy.get(".swapForm > .row") // get rows
          .eq(-2)
          .find("span")
          .eq(1)
          .invoke("text")
          .then((text) => {
            swapRouteLength = text.match(/\w+/g).length // count the symbols in the route
          })
      })
      it("shows review modal with further info", () => {
        // open advanced options
        cy.get("[data-testid=advanced-options]").click()
        // set slippage
        cy.get("[data-testid=custom-slippage]").type("0.8")
        cy.get("[data-testid=swap-btn]").click()
        cy.react("ReviewSwap")
          .find(".swapTable > .row")
          .should("have.length", swapRouteLength)
      })
      // TODO assert countdown value
      it("starts a virtual swap without error", () => {
        // TODO handle high slippage warning (uncontrollable)
        cy.react("ReviewSwap")
          .as("reviewSwap")
          .then(($el) => {
            const $input = $el.find("input[type=checkbox]")
            if ($input.length) {
              $input.click()
            }
          })
        cy.get("@reviewSwap").find("button").contains("Confirm Swap").click()
        // this will fail if an error is logged to the console
      }) // https://dev.to/tylerben/catching-console-error-statements-in-cypress-1b4g
      // pending swap interface
      it(
        "shows the pending swap on the page",
        {
          defaultCommandTimeout: 50000,
        },
        () => {
          cy.react("Modal").should("not.exist")
          cy.get(".pendingSwapItem").should("have.length.at.least", runNumber)
        },
      )
      it("shows the pending swap modal with countdown", () => {
        cy.get(".pendingSwapItem")
          .eq(runNumber - 1)
          .click()
        cy.react("PendingSwapModal").as("pendingSwapModal").should("exist")
        cy.get("[data-testid=PendingSwapModal-time-remaining]").should(
          "contain.text",
          "min remaining",
        )
      })
      it("reveals the exchange interface after countdown", () => {
        const provider = getDefaultProvider(
          Cypress.env("PROVIDER_HOST"),
        ) as JsonRpcProvider
        // move block time forward +10 minutes
        void new Cypress.Promise((resolve) => {
          void provider
            .send("evm_increaseTime", [600]) // +10 minutes
            .then(() => provider.send("evm_mine", []))
            .then(resolve)
        })
        cy.react("PendingSwapExchange").should("exist")
      })
      // settlement flow
      it("allows user to select max balance")
      it("reviews the transaction")
      it("settles in the output currency")
      it("deducts the amount from the previous total")
      // withdraw flow
      it("allows user to select max balance")
      it("reviews the transaction")
      it("withdraws the synth currency")
      it("deducts the amount from the previous total")
      it("hides completed pending swaps")
    })
  }
  // eslint-disable-next-line no-constant-condition
  if (true) {
    testConfigs.forEach((config, i) => testVirtualSwap(config, i + 1))
  }
})
console.log(!!testAssetSwap)
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
      cy.get("div").contains("Price Impact").as("priceImpactEl").should("exist")
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
