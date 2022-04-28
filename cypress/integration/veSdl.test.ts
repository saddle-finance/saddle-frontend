context("veSDL test", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/vesdl`)
  })
  it("veSDL test", () => {
    cy.getBySelId("sdlTokenInput").find("input").should("exist").type("100")
  })
})
