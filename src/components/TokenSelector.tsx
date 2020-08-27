import React from "react"

interface Props {
  tokens: string[]
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

function TokenSelector({ tokens, onChange }: Props) {
  return (
    <select onChange={onChange}>
      {tokens.map((s, i) => (
        <option value={s} key={i}>
          {s}
        </option>
      ))}
    </select>
  )
}

export default TokenSelector
