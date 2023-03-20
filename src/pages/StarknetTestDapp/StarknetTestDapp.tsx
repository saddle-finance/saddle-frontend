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

import { Button, Container, Link, Typography } from "@mui/material"
import React, { ReactElement } from "react"
import { useTranslation } from "react-i18next"

function StarknetTestDapp(): ReactElement {
  const { t } = useTranslation()
  function clickMe() {
    alert("You clicked me!")
  }

  return (
    <Container maxWidth="md" sx={{ pb: 16 }}>
      <Typography variant="h3" mt={5} mb={2}>
        Risk
      </Typography>
      <Typography variant="body1" data-testid="risk-intro">
        {t("riskIntro")}{" "}
        <Link href="https://github.com/saddle-finance/saddle-contract">
          {t("riskIntro2")}
        </Link>{" "}
        <Button onClick={clickMe}> clickme </Button>
        {t("riskIntro3")}
      </Typography>
      <Button onClick={clickMe}> clickme </Button>
      <Typography variant="h3" mt={5} mb={2}>
        {t("audits")}
      </Typography>
      <Typography variant="body1" data-testid="risk-audits">
        {t("riskAudits")}{" "}
        <Link href="https://github.com/saddle-finance/saddle-audits">
          {t("riskAudits2")}
        </Link>
        {"."}
        <br />
        <br />
        {t("riskAudits3")}
        <br />
        <br />
        {t("riskAudits4")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("adminKeys")}
      </Typography>
      <Typography variant="body1" data-testid="risk-adminkeys">
        {t("riskAdminKeys")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("lossOfPeg")}
      </Typography>
      <Typography variant="body1" data-testid="risk-lossofpeg">
        {t("riskLossOfPeg")}
      </Typography>
      <Typography variant="h3" mt={5} mb={2}>
        {t("unnecessaryApprovalAskQ")}
      </Typography>
      <p>
        {t("unnecessaryApprovalAskA")} <br />
        <br />
        <Link href="https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729">
          ERC: Token standard · Issue #20 · ethereum/EIPs
        </Link>
      </p>
      <Typography variant="h3" mt={5} mb={2}>
        {t("permissionlessPools")}
      </Typography>
      <Typography variant="body1" data-testid="risk-lossofpeg">
        {t("riskPermissionlessPools")}
      </Typography>
    </Container>
  )
}

export default StarknetTestDapp
