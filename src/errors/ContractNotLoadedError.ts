export class ContractNotLoadedError extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, ContractNotLoadedError.prototype)
  }

  getErrorMessage() {
    return `Unable to retrieve ${this.message} contract`
  }
}
