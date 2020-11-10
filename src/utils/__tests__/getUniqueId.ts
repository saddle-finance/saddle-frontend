import getUniqueId from "../getUniqueId"

describe("getUniqueId", () => {
  it("returns sequential ids", () => {
    expect(getUniqueId()).toEqual("id-0")
    expect(getUniqueId()).toEqual("id-1")
    expect(getUniqueId()).toEqual("id-2")
  })
})
