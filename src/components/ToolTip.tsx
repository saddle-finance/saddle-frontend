import "./ToolTip.scss"

import React, { ReactElement } from "react"

interface Props {
  content: string
}
export default function ToolTip({
  content,
  children,
}: React.PropsWithChildren<Props>): ReactElement {
  return (
    <div className="toolTip">
      {children}
      <div className="tooltipText">{content}</div>
    </div>
  )
}
