import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { BigNumber, BigNumberish, ContractInterface } from "ethers"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  SDL_TOKEN_ADDRESSES,
  VOTING_ESCROW_CONTRACT_ADDRESS,
} from "../../constants"
import { differenceInMonths, getUnixTime } from "date-fns"
import { formatUnits, parseEther } from "@ethersproject/units"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import GaugeVote from "./GaugeVote"
import LockedInfo from "./LockedInfo"
import SDL_TOKEN_ABI from "../../constants/abis/sdl.json"
import { Sdl } from "../../../types/ethers-contracts/Sdl"
import TokenInput from "../../components/TokenInput"
import VOTING_ESCROW_CONTRACT_ABI from "../../constants/abis/votingEscrow.json"
import { VotingEscrow } from "../../../types/ethers-contracts/VotingEscrow"
import { Zero } from "@ethersproject/constants"
import { enqueueToast } from "../../components/Toastify"
import { getContract } from "../../utils"
// import { getCurrentBlockTimestamp } from "../../utils/getCurrentBlockTimestamp"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

type TokenType = {
  maxBalance: string
  sdlTokenInputVal: string
}

const WEEK = 86400 * 7
const MAXTIME = 86400 * 365 * 4

export default function VeSDL(): JSX.Element {
  const [sdlToken, setSDLToken] = useState<TokenType>({
    maxBalance: "",
    sdlTokenInputVal: "",
  })
  const [veSdlTokenVal, setVeSDLTokenRowVal] = useState<BigNumber>(Zero)
  const [lockedSDLVal, setlockedSDLVal] = useState<BigNumber>(Zero)
  const sdlTokenValue = parseEther(sdlToken.sdlTokenInputVal.trim() || "0")

  const [lockEnd, setLockEnd] = useState<Date | null>(null)
  const [unlockDate, setDate] = useState<Date | null>(null)

  const { account, chainId, library } = useActiveWeb3React()
  const { t } = useTranslation()

  const votingEscrowContract = useMemo(() => {
    if (chainId && library) {
      return getContract(
        VOTING_ESCROW_CONTRACT_ADDRESS?.[chainId],
        VOTING_ESCROW_CONTRACT_ABI as ContractInterface,
        library,
        account ?? undefined,
      ) as VotingEscrow
    }
  }, [account, chainId, library])

  const sdlContract = useMemo(() => {
    if (chainId && library) {
      return getContract(
        SDL_TOKEN_ADDRESSES[chainId],
        SDL_TOKEN_ABI,
        library,
        account ?? undefined,
      ) as Sdl
    }
  }, [account, chainId, library])

  const fetchData = useCallback(async () => {
    if (account) {
      const sdlTokenBal = await sdlContract?.balanceOf(account)
      setSDLToken((prev) => ({
        ...prev,
        sdlTokenInputVal: "",
        maxBalance: formatUnits(sdlTokenBal || Zero),
      }))
      const vesdlBal = await votingEscrowContract?.["balanceOf(address)"](
        account,
      )
      setVeSDLTokenRowVal(vesdlBal || Zero)

      const prevLockend =
        (await votingEscrowContract?.locked__end(account)) || Zero
      setLockEnd(
        !prevLockend.isZero() ? new Date(prevLockend.toNumber() * 1000) : null,
      )

      const vesdlToken = await votingEscrowContract?.locked(account)
      setlockedSDLVal(vesdlToken?.amount || Zero)
    }
  }, [account, sdlContract, votingEscrowContract])

  function calculateLockAmount(
    totalAmount: BigNumberish,
    currentTimestamp: BigNumberish,
    expireTimestamp: BigNumberish,
  ) {
    const roundedExpireTimestamp = BigNumber.from(expireTimestamp)
      .div(WEEK)
      .mul(WEEK)

    return BigNumber.from(totalAmount)
      .mul(BigNumber.from(roundedExpireTimestamp).sub(currentTimestamp))
      .div(MAXTIME)
      .toString()
  }

  const handleSDLTokenChange = (value: string) => {
    setSDLToken((prev) => ({ ...prev, sdlTokenInputVal: value }))
  }
  const expectedLockAmount =
    unlockDate &&
    calculateLockAmount(
      sdlToken.sdlTokenInputVal,
      getUnixTime(new Date()),
      getUnixTime(unlockDate),
    )

  const handleLock = async () => {
    if (!account || !chainId || !votingEscrowContract?.address) return
    try {
      const unlockTimeStamp = unlockDate ? getUnixTime(unlockDate) : null
      if (sdlTokenValue.gt(Zero))
        await sdlContract?.approve(votingEscrowContract?.address, sdlTokenValue)

      if (sdlTokenValue.gt(Zero) && unlockTimeStamp) {
        const txn = await votingEscrowContract?.create_lock(
          sdlTokenValue,
          unlockTimeStamp,
        )
        await txn.wait()
        enqueueToast("success", "Locked")
        void fetchData()
      } else if (
        sdlTokenValue.gt(Zero) &&
        unlockTimeStamp === null &&
        !veSdlTokenVal.isZero()
      ) {
        // Deposit additional SDL into and existing lock
        const txn = await votingEscrowContract.increase_amount(sdlTokenValue)
        await txn.wait()
        enqueueToast("success", "Increased amount")
        void fetchData()
      } else if (
        !sdlTokenValue.gt(Zero) &&
        unlockTimeStamp &&
        !veSdlTokenVal.isZero()
      ) {
        // Extend the unlock time on a lock that already exists
        const txn = await votingEscrowContract.increase_unlock_time(
          BigNumber.from(unlockTimeStamp),
        )
        await txn.wait()
        enqueueToast("success", "Increased lock time")
      }
      void fetchData()
    } catch (err) {
      console.log(err)
    }
  }

  const addLockMos = unlockDate
    ? differenceInMonths(unlockDate, lockEnd || new Date())
    : null

  const lockHelperText = () => {
    if (sdlTokenValue.gt(Zero) && !addLockMos) {
      return t("increaseLockAmount", {
        addLockAmt: sdlToken.sdlTokenInputVal,
      })
    } else if (sdlTokenValue.gt(Zero) && addLockMos && addLockMos > 0) {
      return t("increaseLockAmountAndTime", {
        addLockMos,
        addLockAmt: sdlToken.sdlTokenInputVal,
      })
    } else if (sdlTokenValue.eq(Zero) && addLockMos && addLockMos > 0) {
      return t("increaseLockTime", { addLockMos })
    } else {
      return
    }
  }

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  return (
    <Container sx={{ py: 3 }}>
      <Box display={{ sm: "flex" }} gap={2}>
        <Stack flex={1} spacing={2} mb={2}>
          <Paper
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 4,
            }}
          >
            <Typography variant="h2" textAlign="center">
              {t("sdlLock")}
            </Typography>

            <TokenInput
              data-testid="sdlTokenInput"
              symbol="SDL"
              name="sdl"
              max={sdlToken.maxBalance}
              decimalLength={18}
              onChange={(value) => handleSDLTokenChange(value)}
              inputValue={sdlToken.sdlTokenInputVal}
            />
            <Box display="flex" alignItems="center">
              <div>
                <Typography mr={1} noWrap>
                  {t("unlockDate")}:
                </Typography>
              </div>
              <DatePicker
                value={unlockDate}
                onChange={(date) => setDate(date)}
                minDate={lockEnd}
                renderInput={(props) => (
                  <TextField
                    data-testid="veSdlUnlockData"
                    {...props}
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Box>
            <Box textAlign="center">
              <ArrowDownwardIcon />
            </Box>
            <TokenInput
              symbol="veSDL"
              name={t("voteEscrowSDL")}
              decimalLength={18}
              readonly
              inputValue={expectedLockAmount || "0.0"}
              showUSDprice={false}
            />
            <Typography
              textAlign="center"
              color="primary"
              whiteSpace="pre-line"
            >
              {lockHelperText()}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLock}
            >
              Lock
            </Button>
            <Typography textAlign="end">
              <Link>{t("veTokenCalculator")}</Link>
            </Typography>
            <Divider />
            <Typography variant="h2" textAlign="center" mb={2}>
              {t("veSdlUnlock")}
            </Typography>
            <Typography>
              {t("totalSdlLock")}: {formatUnits(lockedSDLVal)}
            </Typography>
            <Typography>
              {t("lockupExpiry")}:
              {` ${lockEnd ? lockEnd.toLocaleString() : "..."}`}
            </Typography>
            <Typography>
              {t("totalVeSdlHolding")}: {formatUnits(veSdlTokenVal)}
            </Typography>
            <Alert severity="error" icon={false} sx={{ textAlign: "center" }}>
              {t("withdrawAlertMsg", { sdlValue: 3000 })}
            </Alert>
            <Button variant="contained" size="large" fullWidth>
              {t("unlock")}
            </Button>
          </Paper>
          <Paper sx={{ p: 4 }}>
            <Typography variant="h2" textAlign="center" mb={2}>
              {t("veSdlHolderFeeClaim")}
            </Typography>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography>{t("yourSdlFee")}: 200</Typography>
              <Button variant="contained" size="large">
                {t("claim")}
              </Button>
            </Box>
          </Paper>
        </Stack>

        <Stack flex={1} spacing={2}>
          <LockedInfo />
          <GaugeVote />
        </Stack>
      </Box>
    </Container>
  )
}
