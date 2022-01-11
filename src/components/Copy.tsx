import { Button, Typography } from "@mui/material"
import React, { ReactElement } from "react"
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
      color="info"
      onClick={() => setCopied(props.toCopy)}
      startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon />}
    >
      <Typography>{isCopied ? "Copied!" : props.children}</Typography>
    </Button>
  )
}
