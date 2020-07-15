import React from 'react'

function TokenSelector({ label, tokens } : { label: string, tokens: string[]}) {
  return <div className="token-selector">
    <div className="group">
      <label>
        { label }
      </label>
      <input type="number" placeholder="0.0" step="any" />
    </div>
    <select>
      { tokens.map((s, i) => <option value={s} key={i}>{ s }</option>) }
    </select>
  </div>
}

export default TokenSelector
