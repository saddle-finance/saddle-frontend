# saddle-frontend

[![CI](https://github.com/saddle-finance/saddle-frontend/workflows/CI/badge.svg)](https://github.com/saddle-finance/saddle-frontend/actions?query=workflow%3ACI)

An open source UI for Saddle 🤠

The UI is deployed on IPFS and accessible at
[saddle.exchange](https://saddle.exchange/#/) or
[saddlefinance.eth.link](https://saddlefinance.eth.link/#/).

## Installation

#### Configure Github Packages
1. Generate a [Github Personal Access Token](https://github.com/settings/token) with the `read:packages` permission enabled
2. Create a `.npmrc` in your home directory with the following:
```
//npm.pkg.github.com/:_authToken=<PERSONAL_ACCESS_TOKEN_HERE>
```

#### Install Packages
```bash
$ npm install
```

#### Configuration
Create a `.env.local` file with a valid `REACT_APP_NETWORK_URL` (e.g. Alchemy,
Infura):

```bash
REACT_APP_NETWORK_URL="https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY_HERE"
```

## Usage

```bash
$ npm run start
```
