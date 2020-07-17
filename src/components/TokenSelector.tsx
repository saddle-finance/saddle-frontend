import React from 'react'

function TokenSelector({ tokens } : { tokens: string[] }) {
    return <select>
      { tokens.map((s, i) => <option value={s} key={i}>{ s }</option>) }
    </select>
}

export default TokenSelector
