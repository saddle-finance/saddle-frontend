import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit"
import { STALL_TIMEOUT, SUPPORTED_NETWORKS } from "../constants/networks"
import {
  arbitrum,
  aurora,
  avalanche,
  evmos,
  evmosTestnet,
  fantom,
  goerli,
  hardhat,
  mainnet,
  optimism,
  optimismGoerli,
} from "wagmi/chains"
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets"
import { configureChains, createClient } from "wagmi"
import Tally from "../components/Rainbowkit"
import { alchemyProvider } from "wagmi/providers/alchemy"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { publicProvider } from "wagmi/providers/public"

const kava: Readonly<Chain> = {
  id: 2222,
  name: "KAVA",
  network: "kava",
  iconUrl: "",
  iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "Kava",
    symbol: "KAVA",
  },
  rpcUrls: {
    default: {
      http: ["https://evm.kava.io"],
    },
    public: {
      http: ["https://evm.kava.io"],
    },
  },
  blockExplorers: {
    default: { name: "Kava", url: "https://explorer.kava.io" },
  },
  testnet: false,
}

export const chain: Record<string, Chain> = {
  arbitrum,
  aurora,
  avalanche,
  evmos,
  evmosTestnet,
  fantom,
  goerli,
  hardhat,
  mainnet,
  optimism,
  optimismGoerli,
  kava,
}

const alchemyKey = process.env.REACT_APP_ALCHEMY_API_KEY

const { chains, provider } = configureChains(Object.values(chain), [
  alchemyProvider({
    apiKey: alchemyKey!,
    stallTimeout: STALL_TIMEOUT,
    priority: alchemyKey ? 0 : 2,
  }),
  jsonRpcProvider({
    rpc: (networkChain) => ({
      http: SUPPORTED_NETWORKS[networkChain.id]
        ? networkChain.rpcUrls.default.http[0]
        : "",
    }),
  }),
  publicProvider(),
])
const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      metaMaskWallet({ chains }),
      rainbowWallet({ chains }),
      coinbaseWallet({ appName: "Saddle", chains }),
      walletConnectWallet({ chains }),
      Tally({ chains, shimDisconnect: true }),
    ],
  },
  //   { groupName: "More" }, //TODO: add more wallet
])

export const wagmiConfig = createClient({
  autoConnect: true,
  provider,
  connectors,
})

export const activeChainIds = Object.values(chain).map((chain) => chain.id)

export { chains }
