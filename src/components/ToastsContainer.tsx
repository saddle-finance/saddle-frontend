import "./ToastsContainer.scss"

import React, { ReactElement } from "react"

export default function ToastsContainer({
  children,
}: React.PropsWithChildren<{}>): ReactElement {
  return <div className={"toast-container"}>{children}</div>
}
