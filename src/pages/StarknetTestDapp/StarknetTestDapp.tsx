// import { BigNumber, ContractTransaction } from "ethers"
// import {
//   addWalletChangeListener,
//   chainId,
//   connectWallet,
//   removeWalletChangeListener,
//   silentConnectWallet,
// } from "./starknet-utils"
// import React, {
//   ReactElement,
//   useCallback,
//   useContext,
//   useEffect,
//   useState,
// } from "react"
// import Button from "@mui/material/Button"
// import { Container, Link, Typography } from "@mui/material"

// export function StarknetTestDapp(): ReactElement {
//   // export default function StarknetTest() {
//   // from old repo
//   // const { account, chainId } = useActiveWeb3React()
//   // const userState = useContext(UserStateContext)
//   // // unknown
//   // const dispatch = useDispatch()
//   // const { t, i18n } = useTranslation()
//   // // const isValidNetwork =
//   // //   chainId === 0x534e5f474f45524c49 // need to handle chainID a certain way

//   // const currentTimestamp = getUnixTime(new Date())

//   // const [address, setAddress] = useState<string>()
//   // const [supportSessions, setSupportsSessions] = useState<boolean | null>(null)
//   // const [chain, setChain] = useState(chainId())
//   // const [isConnected, setConnected] = useState(false)
//   // const [account, setAccount] = useState<AccountInterface | null>(null)

//   function clickMe() {
//     alert("You clicked me!")
//   }

//   // const handleConnectClick = async () => {
//   //   const wallet = await connectWallet()
//   //   setAddress(wallet?.selectedAddress)
//   //   setChain(chainId())
//   //   setConnected(!!wallet?.isConnected)
//   //   if (wallet?.account) {
//   //     setAccount(wallet.account)
//   //   }
//   //   setSupportsSessions(null)
//   //   if (wallet?.selectedAddress) {
//   //     const sessionSupport = await supportsSessions(
//   //       wallet.selectedAddress,
//   //       wallet.provider,
//   //     )
//   //     console.log(
//   //       "🚀 ~ file: index.tsx ~ line 72 ~ handleConnectClick ~ sessionSupport",
//   //       sessionSupport,
//   //     )
//   //     setSupportsSessions(sessionSupport)
//   //   }
//   // }

//   return (
//     <Container maxWidth="md" sx={{ pb: 16 }}>
//       <Typography variant="h3" mt={5} mb={2}>
//         Risk
//       </Typography>
//       <div>
//         <Button onClick={clickMe}> </Button>
//       </div>
//     </Container>
//   )
// }
// export default StarknetTestDapp

import { Box, Button, Container } from "@mui/material"
import React, { ReactElement } from "react"

function StarknetTestDapp(): ReactElement {
  function clickMe() {
    alert("You clicked me!")
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 5, pb: 20 }}>
      <Box p={{ xs: 3, md: 4 }} flex={1}></Box>
      <Button onClick={clickMe}> clickme </Button>
    </Container>
  )
}

export default StarknetTestDapp
