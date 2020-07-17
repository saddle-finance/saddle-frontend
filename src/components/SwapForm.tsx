import React from 'react'

import TokenAmountSelector from './TokenAmountSelector'

function SwapForm() {
  return <form className="swap">
    <TokenAmountSelector label="From" tokens={['usdc', 'dai', 'usdt']} />
    <TokenAmountSelector label="To" tokens={['usdc', 'dai', 'usdt']} />
    <button type="button">Swap!</button>
  </form>
}

export default SwapForm
