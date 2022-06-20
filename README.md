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

Create a `.env.local` file with

- a valid `REACT_APP_NETWORK_URL` (e.g. Alchemy,
  Infura)
- a valid blocknative API key

```bash
REACT_APP_NETWORK_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY_HERE"
REACT_APP_NOTIFY_DAPP_ID="block-native-api-key-here"
```

## Usage

```bash
$ npm run start
```

## Math

### Max and min SDL reward per Gauge (per second rate)

Min: 0.4 _ SDLPriceUSD _ Minter.rate() _ (GaugeController.gauge_relative_weight / 1e18) / (gauge.working_supply _ lpTokenPriceUSD))

Max: SDLPriceUSD _ Minter.rate() _ (GaugeController.gauge_relative_weight / 1e18) / (gauge.working_supply \* lpTokenPriceUSD))

### Each partner reward per Gauge (per second rate)

Min: 0.4 _ Reward[i].rate _ rewardTokenPriceUSD / (gauge.working*supply * lpTokenPriceUSD)

Max: Reward[i].rate \_ rewardTokenPriceUSD / (gauge.working_supply \* lpTokenPriceUSD)
