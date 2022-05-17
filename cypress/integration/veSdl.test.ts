context("veSDL test", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/vesdl`)
    cy.wait(3000)
  })
  it("veSDL test", () => {
    cy.getBySelId("lockVeSdlBtn").should("be.disabled")
    cy.getBySelId("unlockVeSdlBtn").should("be.disabled")

    cy.getBySelId("sdlTokenInput")
      .find("input")
      .should("exist")
      .type("100")
      .should("have.value", "100")
    cy.getBySelId("veSdlUnlockData")
      .find("input")
      .type("12/02/2022")
      .should("have.value", "12/02/2022")
  })
})
