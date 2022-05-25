const ethers = require("ethers")
const META_SWAP_ABI = require("../src/constants/abis/metaSwap.json")

const { Contract, Wallet, providers } = ethers
const poolAddress = "0xdb5c5A6162115Ce9a188E7D773C4D011F421BbE5"
const provider = new providers.JsonRpcProvider(
  "https://eth.bd.evmos.org:8545",
  9001,
)
const signer = new Wallet("0x" + process.env.DEPLOYER_PRIVATE_KEY, provider)
const metaSwapContract = new Contract(poolAddress, META_SWAP_ABI, signer)
;(async function main() {
  console.log(`Unpausing ${metaSwapContract.address}`)
  const txn = await metaSwapContract.unpause()
  const result = await txn.wait()
  console.log(result)
  console.log(`Unpaused ${metaSwapContract.address}`)
})()
