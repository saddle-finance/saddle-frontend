import { Chain, connectorsForWallets } from "@rainbow-me/rainbowkit"
import { IS_DEVELOPMENT, IS_PRODUCTION } from "../utils/environment"
import {
  arbitrum,
  aurora,
  evmos,
  evmosTestnet,
  fantom,
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

import { STALL_TIMEOUT } from "../constants/networks"
import Tally from "../components/Rainbowkit"
import { infuraProvider } from "wagmi/providers/infura"
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
  mainnet,
  arbitrum,
  aurora,
  evmos,
  evmosTestnet,
  fantom,
  hardhat,
  kava,
  optimism,
  optimismGoerli,
}

const infuraKey = process.env.REACT_APP_INFURA_API_KEY || ""

const { chains, provider, webSocketProvider } = configureChains(
  Object.values(chain),
  [
    ...(IS_DEVELOPMENT
      ? [
          infuraProvider({
            apiKey: infuraKey,
            stallTimeout: STALL_TIMEOUT,
            priority: infuraKey ? 0 : 2,
          }),
        ]
      : []),
    ...(IS_PRODUCTION
      ? [
          infuraProvider({
            apiKey: infuraKey,
            stallTimeout: STALL_TIMEOUT,
            priority: infuraKey ? 0 : 2,
          }),
        ]
      : []),
    publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 1 }),
  ],
)

const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      metaMaskWallet({
        chains,
        projectId: "80f227d3f9ab41c040fab2001ac4ccda",
      }),
      rainbowWallet({
        chains,
        projectId: "80f227d3f9ab41c040fab2001ac4ccda",
      }),
      coinbaseWallet({ appName: "Saddle", chains }),
      walletConnectWallet({
        chains,
        projectId: "80f227d3f9ab41c040fab2001ac4ccda",
      }),
      Tally({ chains, shimDisconnect: true }),
    ],
  },
  //   { groupName: "More" }, //TODO: add more wallet
])

export const wagmiConfig = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
  connectors,
})

export const activeChainIds = Object.values(chain).map((chain) => chain.id)

export { chains }
