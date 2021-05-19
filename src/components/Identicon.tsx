import React, { ReactElement, useEffect, useRef } from "react"

import Jazzicon from "@metamask/jazzicon"
import styled from "@emotion/styled"
import { useActiveWeb3React } from "../hooks"

const StyledIdenticonContainer = styled.div`
  height: 24px;
  width: 24px;
  border-radius: 1.125rem;
  display: inline-block;
  vertical-align: text-bottom;
`

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
    <StyledIdenticonContainer ref={ref as React.RefObject<HTMLDivElement>} />
  )
}
