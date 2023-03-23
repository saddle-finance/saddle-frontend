/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable sort-imports */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { connect, IStarknetWindowObject } from "@argent/get-starknet"
import { BigNumber, BigNumberish } from "ethers"
import {
  Provider,
  constants,
  encode,
  shortString,
  uint256,
  stark,
  hash,
  Account,
  ec,
  Contract,
  AccountInterface,
  InvokeFunctionResponse,
} from "starknet"
import swapABI from "../../constants/abis/swapV2C.json"
import testERC20ABI from "../../constants/abis/starkTestERC20.json"

export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "mainnet-alpha":
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
}
export const MAX_UINT256 = BigNumber.from(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935",
)
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork
export type Network = PublicNetwork | "localhost"

export const silentConnectWallet = async () => {
  const windowStarknet = await connect({ showList: false })
  if (!windowStarknet?.isConnected) {
    await windowStarknet?.enable({
      showModal: false,
      starknetVersion: "v4",
    } as any)
  }
  return windowStarknet
}

export const connectWallet = async () => {
  const windowStarknet = await connect({
    include: ["argentX"],
  })
  await windowStarknet?.enable({ starknetVersion: "v4" } as any)
  return windowStarknet
}

export const walletAddress = async (): Promise<string | undefined> => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    return
  }
  return starknet.selectedAddress
}

export const networkId = async (): Promise<Network | undefined> => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    return
  }
  try {
    const { chainId } = starknet.provider
    if (chainId === constants.StarknetChainId.MAINNET) {
      return "mainnet-alpha"
    } else if (chainId === constants.StarknetChainId.TESTNET) {
      return "goerli-alpha"
    } else {
      return "localhost"
    }
  } catch {}
}

export const addToken = async (address: string): Promise<void> => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  await starknet.request({
    type: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address,
      },
    },
  })
}

export const getExplorerBaseUrl = async (): Promise<string | undefined> => {
  const network = await networkId()
  if (network === "mainnet-alpha") {
    return "https://voyager.online"
  } else if (network === "goerli-alpha") {
    return "https://goerli.voyager.online"
  }
}

export const chainId = async (): Promise<string | undefined> => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    return
  }
  try {
    return shortString.decodeShortString(starknet.provider.chainId)
  } catch {}
}

export const signMessage = async (message: string) => {
  const starknet = await connect()
  if (!starknet?.isConnected) throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return starknet.account.signMessage({
    domain: {
      name: "Example DApp",
      chainId:
        (await networkId()) === "mainnet-alpha" ? "SN_MAIN" : "SN_GOERLI",
      version: "0.0.1",
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Message",
    message: {
      message,
    },
  })
}

export const waitForTransaction = async (hash: string) => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    return
  }
  return starknet.provider.waitForTransaction(hash)
}

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    return
  }
  starknet.on("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  const starknet = await connect()
  if (!starknet?.isConnected) {
    return
  }
  starknet.off("accountsChanged", handleEvent)
}

export const formatAddress = (address: string) =>
  encode.addHexPrefix(encode.removeHexPrefix(address).padStart(64, "0"))

export const truncateAddress = (address: string) => {
  return truncateHex(formatAddress(address))
}

export const truncateHex = (value: string) => {
  const hex = value.slice(0, 2)
  const start = value.slice(2, 6)
  const end = value.slice(-4)
  return `${hex}${start}…${end}`
}

export const newStarknetProvider = () => {
  // use testnet-1 provider
  const testnetOneProvider = new Provider({
    sequencer: {
      baseUrl: "https://alpha4.starknet.io",
      feederGatewayUrl: "feeder_gateway",
      gatewayUrl: "gateway",
    },
  })
  return testnetOneProvider
}

export function fill8array(array: any[], filler: any): any[8] {
  const startIndex = array.length

  array.length = 8
  return array.fill(filler, startIndex, 8)
}

export async function executeContract(
  callerAccount: IStarknetWindowObject,
  contractAddress: string,
  entrypoint: string,
  args: string[],
): Promise<string> {
  const account = callerAccount.account
  let res: string
  const callData = args ? stark.compileCalldata(args) : []

  try {
    const tx = await account.execute([
      {
        contractAddress: contractAddress,
        entrypoint: entrypoint,
        calldata: callData,
      },
    ])
    await callerAccount.provider.waitForTransaction(String(tx.transaction_hash))
    res = tx.transaction_hash
    console.log("tx: ", tx.transaction_hash)
  } catch (error) {
    console.error(error)
    res = String(error)
  }
  return res
}

export async function callContract(
  contractAddr: string,
  entrypoint: string,
  args?: string[],
): Promise<Array<string>> {
  const callData = args ? stark.compileCalldata(args) : []
  const newProvider = newStarknetProvider()
  return (
    await newProvider.callContract({
      contractAddress: contractAddr,
      entrypoint: entrypoint,
      calldata: callData,
    })
  ).result
}
