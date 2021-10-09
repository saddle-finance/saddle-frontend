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
        cy.get("[data-testid=swap-btn]").should("not.be.disabled").click()
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
          cy.get("[data-testid=confirm-transaction]").should("not.exist")
          cy.get(".pendingSwapItem").should("have.length.at.least", runNumber)
        },
      )
      it(
        "shows the pending swap modal with countdown",
        { defaultCommandTimeout: 50000 },
        () => {
          cy.get("[data-testid=confirm-transaction]").should("not.exist")
          cy.get(".pendingSwapItem").last().click()
          cy.react("PendingSwapModal").as("pendingSwapModal").should("exist")
          cy.react("PendingSwapModal")
            .as("pendingSwapModal")
            .contains(/min remaining|Step 2: Settlement/g)
        },
      )
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
      it("allows user to perform the settlement", () => {
        // allows user to select max balance
        cy.get("[data-testid=max-balance-btn]").then((el) => {
          const maxBalance = el.text()
          cy.get("[data-testid=max-balance-btn]").click({ force: true })
          cy.get("[data-testid=settlement-input]")
            .invoke("val")
            .then((val) => assert(Number(val) >= Number(maxBalance)))
        })
        cy.get("[data-testid=settle-as-btn]").click()
        // reviews the transaction
        // settles in the output currency
        // deducts the amount from the previous total
      })
      // it("reviews the transaction")
      // it("settles in the output currency")
      // it("deducts the amount from the previous total")

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
