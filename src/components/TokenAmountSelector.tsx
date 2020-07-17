import React from 'react'

import TokenSelector from './TokenSelector'

function TokenAmountSelector({ label, tokens } : { label: string, tokens: string[]}) {
  return <div className="token-selector">
    <div className="group">
      <label>
        { label }
      </label>
      <input type="number" placeholder="0.0" step="any" />
    </div>
    <TokenSelector tokens={tokens} />
  </div>
}

export default TokenAmountSelector
