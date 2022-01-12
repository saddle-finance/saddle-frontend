import React, { ReactElement } from "react"
import { Button } from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import useCopyClipboard from "../hooks/useCopyClipboard"

export default function CopyHelper(props: {
  toCopy: string
  children?: React.ReactNode
}): ReactElement {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <Button
      onClick={() => setCopied(props.toCopy)}
      startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon />}
    >
      {isCopied ? "Copied!" : props.children}
    </Button>
  )
}
