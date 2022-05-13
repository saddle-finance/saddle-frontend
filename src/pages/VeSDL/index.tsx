import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { differenceInMonths, format, getUnixTime } from "date-fns"
import { formatUnits, parseEther } from "@ethersproject/units"
import {
  useSdlContract,
  useVotingEscrowContract,
} from "../../hooks/useContract"

import { AppState } from "../../state"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { BigNumber } from "ethers"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import GaugeVote from "./GaugeVote"
import LockedInfo from "./LockedInfo"
import TokenInput from "../../components/TokenInput"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../../utils/checkAndApproveTokenForTrade"
import { enqueueToast } from "../../components/Toastify"
import { minBigNumber } from "../../utils/minBigNumber"
import { useActiveWeb3React } from "../../hooks"
import { useSelector } from "react-redux"
import { useTranslation } from "react-i18next"

type TokenType = {
  maxBalance: string
  sdlTokenInputVal: string
}

const MAXTIME = 86400 * 365 * 4

export default function VeSDL(): JSX.Element {
  const [sdlToken, setSDLToken] = useState<TokenType>({
    maxBalance: "",
    sdlTokenInputVal: "",
  })
  const [veSdlTokenVal, setVeSdlTokenVal] = useState<BigNumber>(Zero)
  const [lockedSDLVal, setLockedSDLVal] = useState<BigNumber>(Zero)
  const sdlTokenValue = parseEther(sdlToken.sdlTokenInputVal.trim() || "0.0")

  const [lockEnd, setLockEnd] = useState<Date | null>(null)
  const [unlockDate, setUnlockDate] = useState<Date | null>(null)
  const [initialLoading, setInitialLoading] = useState<boolean>(false)
  const { infiniteApproval } = useSelector((state: AppState) => state.user)

  const { account, chainId } = useActiveWeb3React()
  const votingEscrowContract = useVotingEscrowContract()
  const sdlContract = useSdlContract()

  const { t } = useTranslation()

  const fetchData = useCallback(async () => {
    if (account) {
      const sdlTokenBal = await sdlContract?.balanceOf(account)
      setSDLToken((prev) => ({
        ...prev,
        maxBalance: formatUnits(sdlTokenBal || Zero),
      }))
      const vesdlBal = await votingEscrowContract?.["balanceOf(address)"](
        account,
      )
      setVeSdlTokenVal(vesdlBal || Zero)

      const prevLockEnd =
        (await votingEscrowContract?.locked__end(account)) || Zero
      setLockEnd(
        !prevLockEnd.isZero() ? new Date(prevLockEnd.toNumber() * 1000) : null,
      )

      const veSdlToken = await votingEscrowContract?.locked(account)
      setLockedSDLVal(veSdlToken?.amount || Zero)
    }
  }, [account, sdlContract, votingEscrowContract])
  const resetFormState = () => {
    setSDLToken((prev) => ({
      ...prev,
      sdlTokenInputVal: "",
    }))
    setUnlockDate(null)
  }

  const currentTimestamp = getUnixTime(new Date())
  const unlockDateOrLockEnd = unlockDate || lockEnd
  const expireTimestamp =
    unlockDateOrLockEnd && !isNaN(unlockDateOrLockEnd.valueOf())
      ? getUnixTime(unlockDateOrLockEnd)
      : undefined
  const totalAmount =
    !sdlTokenValue.isZero() || unlockDate
      ? sdlTokenValue.add(lockedSDLVal)
      : Zero

  // Calculate estimated veSdl amount
  const estLockAmt = expireTimestamp
    ? totalAmount
        .mul(
          BigNumber.from(expireTimestamp).sub(BigNumber.from(currentTimestamp)),
        )
        .div(BigNumber.from(MAXTIME))
    : Zero

  // Calculate penalty Ratio and penalty amount
  const leftTimeForUnlock = lockEnd && getUnixTime(lockEnd) - currentTimestamp
  const penaltyAmount = leftTimeForUnlock
    ? minBigNumber(
        lockedSDLVal.mul(BigNumber.from(3)).div(BigNumber.from(4)),
        lockedSDLVal
          .mul(BigNumber.from(leftTimeForUnlock))
          .div(BigNumber.from(MAXTIME)),
      )
    : Zero

  const handleLock = async () => {
    const unlockTimeStamp = unlockDate ? getUnixTime(unlockDate) : null
    const hasLockedSDL = !lockedSDLVal.isZero()
    const shouldCreateLock =
      !hasLockedSDL && sdlTokenValue.gt(Zero) && unlockTimeStamp
    const shouldIncreaseAmoutAndLockEnd =
      hasLockedSDL && sdlTokenValue.gt(Zero) && unlockTimeStamp
    const shouldIncreaseAmount =
      hasLockedSDL && sdlTokenValue.gt(Zero) && !unlockTimeStamp
    const shouldIncreaseLockEnd =
      hasLockedSDL && sdlTokenValue.isZero() && unlockTimeStamp

    if (!account || !chainId || !votingEscrowContract?.address) return
    try {
      if (sdlTokenValue.gt(Zero)) {
        await checkAndApproveTokenForTrade(
          sdlContract,
          votingEscrowContract.address,
          account,
          sdlTokenValue,
          infiniteApproval,
        )
      }

      if (shouldCreateLock && unlockTimeStamp) {
        const txn = await votingEscrowContract?.create_lock(
          sdlTokenValue,
          unlockTimeStamp,
        )
        await txn.wait()
        enqueueToast("success", "Locked SDL")
      } else if (shouldIncreaseAmoutAndLockEnd) {
        const txnIncreaseAmount = await votingEscrowContract.increase_amount(
          sdlTokenValue,
        )
        await txnIncreaseAmount.wait()
        const txnIncreaseUnlockTime =
          await votingEscrowContract.increase_unlock_time(
            BigNumber.from(unlockTimeStamp),
          )
        await txnIncreaseUnlockTime.wait()
        enqueueToast("success", "Increased unlock time")
      } else if (shouldIncreaseAmount) {
        // Deposit additional SDL into and existing lock
        const txn = await votingEscrowContract.increase_amount(sdlTokenValue)
        await txn.wait()
      } else if (shouldIncreaseLockEnd) {
        // Extend the unlock time on a lock that already exists
        const txn = await votingEscrowContract.increase_unlock_time(
          BigNumber.from(unlockTimeStamp),
        )
        await txn.wait()
        enqueueToast("success", "Increased lock amount")
      }
      void fetchData()
      resetFormState()
    } catch (err) {
      console.log(err)
    }
  }

  const handleUnlock = useCallback(async () => {
    if (votingEscrowContract) {
      const txn = await votingEscrowContract?.force_withdraw()
      await txn.wait()
      enqueueToast("success", "Unlocked")
      void fetchData()
    }
  }, [])

  const addLockMos =
    unlockDate && !isNaN(unlockDate.valueOf())
      ? differenceInMonths(unlockDate, lockEnd || new Date())
      : 0

  const lockHelperText = () => {
    if (lockedSDLVal.isZero()) {
      if (sdlTokenValue.gt(Zero) && addLockMos > 0)
        return t("lockSdl", {
          sdlAmount: sdlToken.sdlTokenInputVal,
          period: addLockMos,
        })
    } else {
      if (sdlTokenValue.gt(Zero) && !addLockMos) {
        return t("increaseLockAmount", {
          addLockAmt: sdlToken.sdlTokenInputVal,
        })
      } else if (sdlTokenValue.gt(Zero) && addLockMos > 0) {
        return t("increaseLockAmountAndTime", {
          addLockMos,
          addLockAmt: sdlToken.sdlTokenInputVal,
        })
      } else if (sdlTokenValue.eq(Zero) && addLockMos > 0) {
        return t("increaseLockTime", { addLockMos })
      } else {
        return
      }
    }
  }

  const enableLock = lockedSDLVal.isZero()
    ? !sdlToken.sdlTokenInputVal || !unlockDate
    : !sdlToken.sdlTokenInputVal && !unlockDate

  useEffect(() => {
    const init = async () => {
      setInitialLoading(true)
      await fetchData()
      setInitialLoading(false)
    }
    void init()
  }, [fetchData])

  if (initialLoading) return <LinearProgress />

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
              token={{
                decimals: 18,
                symbol: "SDL",
                name: "SDL",
                priceUSD: 0,
              }}
              max={sdlToken.maxBalance}
              onChange={(value) =>
                setSDLToken((prev) => ({ ...prev, sdlTokenInputVal: value }))
              }
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
                onChange={(date) => setUnlockDate(date)}
                minDate={lockEnd || new Date()}
                maxDate={new Date((currentTimestamp + MAXTIME) * 1000)}
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
              token={{
                decimals: 18,
                symbol: "veSDL",
                name: t("voteEscrowSDL"),
                priceUSD: 0,
              }}
              readonly
              inputValue={formatUnits(estLockAmt)}
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
              data-testid="lockVeSdlBtn"
              fullWidth
              size="large"
              onClick={handleLock}
              disabled={enableLock}
            >
              {lockedSDLVal.isZero() ? t("createLock") : t("adjustLock")}
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
              {` ${lockEnd ? format(lockEnd, "MM/dd/yyyy") : "..."}`}
            </Typography>
            <Typography>
              {t("totalVeSdlHolding")}: {formatUnits(veSdlTokenVal)}
            </Typography>
            {penaltyAmount && (
              <Alert
                severity="error"
                icon={false}
                sx={{
                  textAlign: "center",
                }}
              >
                {t("withdrawAlertMsg", {
                  sdlValue: formatUnits(penaltyAmount),
                })}
              </Alert>
            )}
            <Button
              variant="contained"
              data-testid="unLockVeSdlBtn"
              onClick={handleUnlock}
              size="large"
              fullWidth
              disabled={lockedSDLVal.isZero()}
            >
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
