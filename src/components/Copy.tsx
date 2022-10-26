import React, { ReactElement } from "react"
import { Button } from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import useCopyClipboard from "../hooks/useCopyClipboard"
import { useTranslation } from "react-i18next"

export default function CopyHelper(props: {
  toCopy: string
  children?: React.ReactNode
}): ReactElement {
  const [isCopied, setCopied] = useCopyClipboard()
  const { t } = useTranslation()

  return (
    <Button
      onClick={() => setCopied(props.toCopy)}
      startIcon={isCopied ? <CheckIcon /> : <ContentCopyIcon />}
      sx={{ padding: 0 }}
    >
      {isCopied ? t("copied") : t("copyAddress")}
    </Button>
  )
}
