// / <reference types="react-scripts" />

declare module "*.svg"

interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
  }
  web3?: {}
}
