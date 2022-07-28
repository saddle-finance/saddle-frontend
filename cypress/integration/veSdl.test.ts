context("veSDL test", () => {
  beforeEach(() => {
    cy.reload()
    cy.visit(`/#/vesdl`).waitForReact(2000)
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
      .clear()
      .type("07/28/2022", { force: true })
      .wait(2000)
      .should("have.value", "07/28/2022")
  })
})
