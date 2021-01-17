// / <reference types="react-scripts" />

declare module "*.svg"

declare module "*.png"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Window {
  ethereum?: {
    isMetaMask?: true
    on?: (...args: any[]) => void
    removeListener?: (...args: any[]) => void
  }
  gtag?: (...args: any[]) => void
  web3?: {}
}
