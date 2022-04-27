context("veSDL test", () => {
  beforeEach(() => {
    const host = Cypress.env("DAPP_HOST") as string
    cy.visit(`${host}#/vesdl`)
    cy.wait(3000)
  })
  it("veSDL test", () => {
    cy.get("[data-testid=sdlTokenInput]").should("exist")
  })
})
