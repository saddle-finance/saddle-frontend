import React, { ReactElement } from "react"
import check from "../assets/icons/check.svg"
import copy from "../assets/icons/copy.svg"
import useCopyClipboard from "../hooks/useCopyClipboard"

export default function CopyHelper(props: {
  toCopy: string
  children?: React.ReactNode
}): ReactElement {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <button className="textStyle" onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <>
          <img src={check} />
          <span className="textStyle">Copied!</span>
        </>
      ) : (
        <img src={copy} />
      )}
      {isCopied ? "" : props.children}
    </button>
  )
}
