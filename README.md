# saddle-frontend

[![CI](https://github.com/saddle-finance/saddle-frontend/workflows/CI/badge.svg)](https://github.com/saddle-finance/saddle-frontend/actions?query=workflow%3ACI)

An open source UI for Saddle 🤠

The UI is deployed on IPFS and accessible at
[saddle.exchange](https://saddle.exchange/#/) or
[saddlefinance.eth.link](https://saddlefinance.eth.link/#/).

## Installation

```bash
$ npm install
```

Create a `.env.local` file with a valid `REACT_APP_NETWORK_URL` (e.g. Alchemy,
Infura):

```bash
REACT_APP_NETWORK_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY_HERE"
```

### Pool Stats Setup

Pool stats data is required to calculate lifetime deposits, withdrawals and
profit in USD/BTC.  You will need to update the `ChainId.HARDHAT` value for
`POOL_STATS_URL` in `src/constants/index.ts` to point to your own [Fleek
bucket](https://fleek.co/):

```typescript
export const POOL_STATS_URL: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: "https://ipfs.saddle.exchange/pool-stats.json",
  [ChainId.HARDHAT]:
    "https://YOUR_BUCKET_NAME_HERE.storage.fleek.co/pool-stats-dev.json",
}
```

You will also need to run the stats script in the [saddle-pool-stats
repo](https://github.com/saddle-finance/saddle-pool-stats) after every
transaction to update the pool stats to have the numbers computed correctly.

## Usage

```bash
$ npm run start
```
