import React from 'react'

import TokenAmountSelector from './TokenAmountSelector'

function EarnForm() {
  return <form className="earn">
    <TokenAmountSelector label="From" tokens={['tbtc', 'wbtc']} />
    <TokenAmountSelector label="To" tokens={['wbtc', 'tbtc']} />
    <button type="button">Earn!</button>
  </form>
}

export default EarnForm
