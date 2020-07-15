import React from 'react'

import TokenSelector from './TokenSelector'

function EarnForm() {
  return <form className="earn">
    <TokenSelector label="From" tokens={['tbtc', 'wbtc']} />
    <TokenSelector label="To" tokens={['wbtc', 'tbtc']} />
    <button type="button">Earn!</button>
  </form>
}

export default EarnForm
