import React from 'react'

import TokenSelector from './TokenSelector'

function SwapForm() {
  return <form className="swap">
    <TokenSelector label="From" tokens={['tbtc', 'wbtc']} />
    <TokenSelector label="To" tokens={['wbtc', 'tbtc']} />
    <button type="button">Swap!</button>
  </form>
}

export default SwapForm
