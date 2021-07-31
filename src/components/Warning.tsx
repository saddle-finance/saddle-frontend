import "./Warning.scss"

import React, { ReactElement, ReactNode } from "react"

interface Props {
  children: ReactNode
  height?: string
  width?: string
}

function Warning(props: React.PropsWithChildren<Props>): ReactElement | null {
  const { width = "100%", children } = props
  return (
    <div className="warning" style={{ width: width }}>
      {/* warning content */}
      <div className="warningContent">{children}</div>
    </div>
  )
}

export default Warning
