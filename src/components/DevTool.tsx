import React from "react"

//TODO:
// Only visible in dev mode
// Simple input on frontend that allows the user to input a number and submit with a button click
// Clicking the button sends `evm_increaseTime` command to EVM and then mines the next block
// Sends feedback to the user (probably an enqueue toast) upon success/failure

// Code example here https://github.com/saddle-finance/saddle-frontend/blob/master/cypress/integration/deposit.test.ts#L15

// Useful ethers calls for checking time / skipping time
// ```
// // Find the lastest block's timestamp
// let blockNumBefore = await ethers.provider.getBlockNumber();
// let blockBefore = await ethers.provider.getBlock(blockNumBefore);
// let timestampBefore = blockBefore.timestamp;
// console.log({ timestampBefore })

// // Increase next block's time by delta and mine that block.
// await hre.network.provider.send("evm_increaseTime", [36000])
// await hre.network.provider.send("evm_mine")
// ```

export default function DevTool() {
  return <div>DevTool</div>
}
