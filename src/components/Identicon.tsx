import React, { ReactElement, useEffect, useRef } from "react"

import { Box } from "@mui/material"
import Jazzicon from "@metamask/jazzicon"
import { useActiveWeb3React } from "../hooks"

export default function Identicon(): ReactElement {
  const ref = useRef<HTMLDivElement>()

  const { account } = useActiveWeb3React()

  useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = ""
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ref.current.appendChild(Jazzicon(24, parseInt(account.slice(2, 10), 16)))
    }
  }, [account])

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
  return (
    <Box
      height={24}
      width={24}
      display={"inline-block"}
      ref={ref as React.RefObject<HTMLDivElement>}
    />
  )
}
