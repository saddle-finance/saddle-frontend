export function getEtherscanLink(
  data: string,
  type: "transaction" | "token" | "address" | "block",
): string {
  const prefix = `https://etherscan.io`

  switch (type) {
    case "transaction": {
      return `${prefix}/tx/${data}`
    }
    case "token": {
      return `${prefix}/token/${data}`
    }
    case "block": {
      return `${prefix}/block/${data}`
    }
    case "address":
    default: {
      return `${prefix}/address/${data}`
    }
  }
}
