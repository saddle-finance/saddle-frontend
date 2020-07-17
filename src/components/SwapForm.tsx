import React from 'react'

import TokenSelector from './TokenSelector'

function SwapForm() {
  return <form className="swap">
    <TokenSelector label="From" tokens={['usdc', 'dai', 'usdt']} />
    <TokenSelector label="To" tokens={['usdc', 'dai', 'usdt']} />
    <button type="button">Swap!</button>
  </form>
}

export default SwapForm
