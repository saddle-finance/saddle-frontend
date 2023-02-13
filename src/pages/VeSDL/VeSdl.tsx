import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Link,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { BigNumber, ContractTransaction } from "ethers"
import React, { useCallback, useContext, useEffect, useState } from "react"
import {
  addWeeks,
  format,
  formatDuration,
  getUnixTime,
  isFuture,
  secondsToHours,
} from "date-fns"
import { commify, formatUnits, parseEther } from "@ethersproject/units"
import { enUS, zhCN } from "date-fns/locale"
import { enqueuePromiseToast, enqueueToast } from "../../components/Toastify"
import {
  formatBNToString,
  getIntervalBetweenTwoDates,
  missingKeys,
} from "../../utils"
import { useDispatch, useSelector } from "react-redux"
import {
  useFeeDistributor,
  useSdlContract,
  useVotingEscrowContract,
} from "../../hooks/useContract"

import { AppState } from "../../state"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { ChainId } from "../../constants/networks"
import ConfirmModal from "../../components/ConfirmModal"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import DevTool from "../../components/DevTool/DevTool"
import GaugeVote from "./GaugeVote"
import LaunchIcon from "@mui/icons-material/Launch"
import LockedInfo from "./LockedInfo"
import { TRANSACTION_TYPES } from "../../constants"
import TokenInput from "../../components/TokenInput"
import { UserStateContext } from "../../providers/UserStateProvider"
import VeSDLWrongNetworkModal from "./VeSDLWrongNetworkModal"
import VeTokenCalculator from "./VeTokenCalculator"
import { Zero } from "@ethersproject/constants"
import checkAndApproveTokenForTrade from "../../utils/checkAndApproveTokenForTrade"
import { minBigNumber } from "../../utils/minBigNumber"
import { updateLastTransactionTimes } from "../../state/application"
import { useActiveWeb3React } from "../../hooks"
import { useTranslation } from "react-i18next"

type TokenType = {
  maxBalance: string
  sdlTokenInputVal: string
}

const MAXTIME = 86400 * 365 * 4
const WEEK = 7
const WEEK_HOUR = 24 * 7
const THURSDAY = 4

export default function VeSDL(): JSX.Element {
  const [sdlToken, setSDLToken] = useState<TokenType>({
    maxBalance: "",
    sdlTokenInputVal: "",
  })
  const [veSdlTokenBalance, setVeSdlTokenBalance] = useState<BigNumber>(Zero)
  const [lockedSDLVal, setLockedSDLVal] = useState<BigNumber>(Zero)
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState<boolean>(false)
  const sdlTokenInputValueBn = parseEther(
    sdlToken.sdlTokenInputVal.trim() || "0.0",
  )
  const [veSDLTotalSupply, setVeSDLTotalSupply] = useState<BigNumber>(Zero)
  const [loading, setLoading] = useState<boolean>(true)

  const [lockEnd, setLockEnd] = useState<Date | null>(null)
  const [proposedUnlockDate, setProposedUnlockDate] = useState<Date | null>(
    null,
  )
  const { infiniteApproval } = useSelector((state: AppState) => state.user)

  const { account, chainId } = useActiveWeb3React()
  const votingEscrowContract = useVotingEscrowContract()
  const sdlContract = useSdlContract()
  const userState = useContext(UserStateContext)
  const feeDistributorContract = useFeeDistributor()
  const dispatch = useDispatch()

  const [openCalculator, setOpenCalculator] = useState<boolean>(false)
  const { t, i18n } = useTranslation()
  const isValidNetwork =
    chainId === ChainId.MAINNET || chainId === ChainId.HARDHAT

  const fetchData = useCallback(async () => {
    if (account && sdlContract && votingEscrowContract) {
      const sdlTokenBal = await sdlContract.balanceOf(account)
      setSDLToken((prev) => ({
        ...prev,
        maxBalance: formatUnits(sdlTokenBal || Zero),
      }))
      const veSDLBal = await votingEscrowContract["balanceOf(address)"](account)
      const totalSupply = await votingEscrowContract["totalSupply()"]()
      setVeSDLTotalSupply(totalSupply)
      setVeSdlTokenBalance(veSDLBal)

      const prevLockEnd = await votingEscrowContract.locked__end(account)
      setLockEnd(
        !prevLockEnd.isZero() ? new Date(prevLockEnd.toNumber() * 1000) : null,
      )

      const lockedVeSdlToken = await votingEscrowContract.locked(account)
      setLockedSDLVal(lockedVeSdlToken.amount)
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [account, sdlContract, votingEscrowContract])

  useEffect(() => {
    const init = async () => {
      await fetchData()
    }
    void init()
  }, [fetchData])

  const resetFormState = () => {
    setSDLToken((prev) => ({
      ...prev,
      sdlTokenInputVal: "",
    }))
    setProposedUnlockDate(null)
  }
  const feeDistributorRewards = userState?.feeDistributorRewards
  const currentTimestamp = getUnixTime(new Date())
  const unlockDateOrLockEnd = proposedUnlockDate || lockEnd
  const expireTimestamp =
    unlockDateOrLockEnd && !isNaN(unlockDateOrLockEnd.valueOf())
      ? getUnixTime(unlockDateOrLockEnd)
      : undefined
  const totalAmount =
    !sdlTokenInputValueBn.isZero() || proposedUnlockDate
      ? sdlTokenInputValueBn.add(lockedSDLVal)
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
  const isExpired = leftTimeForUnlock && leftTimeForUnlock <= 0
  const penaltyAmount =
    !isExpired && leftTimeForUnlock
      ? minBigNumber(
          lockedSDLVal.mul(BigNumber.from(3)).div(BigNumber.from(4)),
          lockedSDLVal
            .mul(BigNumber.from(leftTimeForUnlock))
            .div(BigNumber.from(MAXTIME)),
        )
      : Zero

  const penaltyPercent = !lockedSDLVal.isZero()
    ? penaltyAmount.mul(parseEther("100")).div(lockedSDLVal)
    : Zero

  const claimFeeDistributorRewards = useCallback(() => {
    if (!chainId || !feeDistributorContract) return
    feeDistributorContract["claim()"]()
      .then((txn) => {
        void enqueuePromiseToast(chainId, txn.wait(), "claim")
        dispatch(
          updateLastTransactionTimes({
            [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
          }),
        )
      })
      .catch(console.error)
  }, [chainId, feeDistributorContract, dispatch])

  const handleLock = async () => {
    const unlockTimeStamp = proposedUnlockDate
      ? getUnixTime(proposedUnlockDate)
      : null
    const hasLockedSDL = !lockedSDLVal.isZero()
    const shouldCreateLock =
      !hasLockedSDL && sdlTokenInputValueBn.gt(Zero) && unlockTimeStamp
    const shouldIncreaseAmountAndLockEnd =
      hasLockedSDL && sdlTokenInputValueBn.gt(Zero) && unlockTimeStamp
    const shouldIncreaseAmount =
      hasLockedSDL && sdlTokenInputValueBn.gt(Zero) && !unlockTimeStamp
    const shouldIncreaseLockEnd =
      hasLockedSDL && sdlTokenInputValueBn.isZero() && unlockTimeStamp

    if (!account || !chainId || !votingEscrowContract.address) return
    try {
      if (sdlTokenInputValueBn.gt(Zero)) {
        await checkAndApproveTokenForTrade(
          sdlContract,
          votingEscrowContract.address,
          account,
          sdlTokenInputValueBn,
          infiniteApproval,
        )
      }

      if (shouldCreateLock && unlockTimeStamp) {
        const txn = await votingEscrowContract.create_lock(
          sdlTokenInputValueBn,
          unlockTimeStamp,
        )
        await enqueuePromiseToast(chainId, txn.wait(), "createLock")
      } else if (shouldIncreaseAmountAndLockEnd) {
        const txnIncreaseAmount = await votingEscrowContract.increase_amount(
          sdlTokenInputValueBn,
        )
        await txnIncreaseAmount.wait()
        const txnIncreaseUnlockTime =
          await votingEscrowContract.increase_unlock_time(
            BigNumber.from(unlockTimeStamp),
          )
        await txnIncreaseUnlockTime.wait()
        enqueueToast("success", "Increased amount and unlock time")
      } else if (shouldIncreaseAmount) {
        // Deposit additional SDL into and existing lock
        const txn = await votingEscrowContract.increase_amount(
          sdlTokenInputValueBn,
        )
        await txn.wait()
        void enqueuePromiseToast(chainId, txn.wait(), "increaseLockAmt")
      } else if (shouldIncreaseLockEnd) {
        // Extend the unlock time on a lock that already exists
        const txn = await votingEscrowContract.increase_unlock_time(
          BigNumber.from(unlockTimeStamp),
        )
        await txn.wait()
        void enqueuePromiseToast(chainId, txn.wait(), "increaseLockEndTime")
      }
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
        }),
      )
      void fetchData()
      resetFormState()
    } catch (err) {
      console.log(err)
    }
  }

  const unlock = async () => {
    if (votingEscrowContract && chainId && lockEnd) {
      const txn = await getUnlockTransaction(lockEnd)
      void enqueuePromiseToast(chainId, txn.wait(), "unlock")
      dispatch(
        updateLastTransactionTimes({
          [TRANSACTION_TYPES.STAKE_OR_CLAIM]: Date.now(),
        }),
      )
      void fetchData()
    } else {
      enqueueToast("error", "Unable to unlock")
      console.error(
        `Unable to Unlock: ${missingKeys({
          votingEscrowContract,
          chainId,
          lockEnd,
        }).join(", ")} missing`,
      )
    }
  }

  const handleUnlock = () => {
    if (penaltyAmount.isZero() || isExpired) {
      void unlock()
    } else {
      setUnlockConfirmOpen(true)
    }
  }

  const getUnlockTransaction = (
    unlockDate: Date,
  ): Promise<ContractTransaction> => {
    if (isFuture(unlockDate)) {
      return votingEscrowContract.force_withdraw()
    }
    return votingEscrowContract.withdraw()
  }

  const duration =
    proposedUnlockDate &&
    !isNaN(proposedUnlockDate.valueOf()) &&
    getIntervalBetweenTwoDates(proposedUnlockDate, lockEnd)
  const additionalLockDuration =
    duration &&
    formatDuration(
      {
        ...duration,
        weeks: Math.floor((duration.days || 0) / WEEK),
        days: duration.days || 0 % WEEK,
      },
      {
        format: ["years", "months", "weeks"],
        locale: i18n.language === "en" ? enUS : zhCN,
      },
    )

  const lockHelperText = () => {
    if (lockedSDLVal.isZero()) {
      if (sdlTokenInputValueBn.gt(Zero) && additionalLockDuration)
        return t("lockSdl", {
          sdlAmount: sdlToken.sdlTokenInputVal,
          period: additionalLockDuration,
        })
    } else {
      if (sdlTokenInputValueBn.gt(Zero) && !additionalLockDuration) {
        return t("increaseLockAmount", {
          addLockAmt: sdlToken.sdlTokenInputVal,
        })
      } else if (sdlTokenInputValueBn.gt(Zero) && additionalLockDuration) {
        return t("increaseLockAmountAndTime", {
          addLockMonths: additionalLockDuration,
          addLockAmt: sdlToken.sdlTokenInputVal,
        })
      } else if (sdlTokenInputValueBn.eq(Zero) && additionalLockDuration) {
        return t("increaseLockTime", { addLockMonths: additionalLockDuration })
      } else {
        return
      }
    }
  }

  const disableLock = lockedSDLVal.isZero()
    ? !sdlToken.sdlTokenInputVal || !proposedUnlockDate //Disable create lock button if no sdl token value or no unlock date
    : !sdlToken.sdlTokenInputVal && !proposedUnlockDate //Disable create lock button if no sdl token value and no unlock date

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
              inputType="numeric"
              showUSDprice={false}
              token={{
                decimals: 18,
                symbol: "SDL",
                name: "SDL",
                priceUSD: 0,
              }}
              disabled={
                !veSdlTokenBalance.isZero() && Boolean(proposedUnlockDate)
              }
              max={sdlToken.maxBalance}
              onChange={(value) => {
                if (value === ".") return
                setSDLToken((prev) => ({
                  ...prev,
                  sdlTokenInputVal: value,
                }))
              }}
              inputValue={sdlToken.sdlTokenInputVal}
            />
            <Box display="flex" alignItems="center">
              <div>
                <Typography mr={1} noWrap>
                  {t("unlockDate")}:
                </Typography>
              </div>
              <DatePicker
                disabled={
                  !veSdlTokenBalance.isZero() && sdlTokenInputValueBn.gt(Zero)
                }
                value={proposedUnlockDate}
                onChange={(date) => setProposedUnlockDate(date)}
                minDate={addWeeks(lockEnd || new Date(), 1)}
                maxDate={new Date((currentTimestamp + MAXTIME) * 1000)}
                shouldDisableDate={(date) => date.getDay() !== THURSDAY}
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
                isOnTokenLists: false,
                address: "0x0",
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
              onClick={() => void handleLock()}
              disabled={disableLock || !isValidNetwork}
            >
              {lockedSDLVal.isZero() ? t("createLock") : t("adjustLock")}
            </Button>
            <Box display="flex" justifyContent="space-between">
              <Tooltip title={<>{t("lockingExplaination")}</>}>
                <Link
                  href="https://docs.saddle.finance/vesdl-vote-escrowed-sdl"
                  target="_blank"
                  rel="noopener"
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography pr={1}>{t("infoAboutLocking")}</Typography>
                    <LaunchIcon fontSize="inherit" />
                  </Box>
                </Link>
              </Tooltip>
              <Link onClick={() => setOpenCalculator(true)}>
                <Typography>{t("veTokenCalculator")}</Typography>
              </Link>
            </Box>
            <Divider />
            <Typography variant="h2" textAlign="center" mb={2}>
              {t("veSdlUnlock")}
            </Typography>
            <Typography>
              {t("totalSdlLock")}:
              <Typography component="span" ml={1}>
                {loading ? (
                  <Skeleton width="100px" sx={{ display: "inline-block" }} />
                ) : (
                  commify(formatBNToString(lockedSDLVal, 18, 2))
                )}
              </Typography>
            </Typography>
            <Typography>
              {t("lockupExpiry")}:
              {` ${lockEnd ? format(lockEnd, "MM/dd/yyyy") : "..."}`}
            </Typography>
            <Typography flexWrap="nowrap">
              {t("totalVeSdlHolding")}:
              <Typography component="span" ml={1}>
                {loading ? (
                  <Skeleton width="100px" sx={{ display: "inline-block" }} />
                ) : (
                  commify(formatBNToString(veSdlTokenBalance, 18, 2))
                )}
              </Typography>
            </Typography>
            {!penaltyAmount.isZero() && leftTimeForUnlock && !isExpired && (
              <Alert
                severity="error"
                icon={false}
                sx={{
                  textAlign: "center",
                }}
              >
                {t("withdrawAlertMsg", {
                  sdlValue: commify(formatBNToString(penaltyAmount, 18, 2)),
                  weeksLeftForUnlock: Math.ceil(
                    secondsToHours(leftTimeForUnlock) / WEEK_HOUR,
                  ),
                })}
              </Alert>
            )}
            <Button
              variant="contained"
              data-testid="unlockVeSdlBtn"
              onClick={handleUnlock}
              size="large"
              fullWidth
              disabled={lockedSDLVal.isZero() || !isValidNetwork}
            >
              {t("unlock")}
            </Button>
          </Paper>
          <DevTool />
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
              <Typography>
                {t("yourSdlFee")}:{" "}
                {commify(
                  formatBNToString(feeDistributorRewards || Zero, 18, 2),
                )}
              </Typography>
              <Button
                variant="contained"
                size="large"
                disabled={!feeDistributorRewards?.gt(Zero) || !isValidNetwork}
                onClick={claimFeeDistributorRewards}
              >
                {t("claim")}
              </Button>
            </Box>
          </Paper>
        </Stack>

        <Stack flex={1} spacing={2}>
          <LockedInfo />
          <GaugeVote veSdlBalance={veSdlTokenBalance} />
        </Stack>
      </Box>
      {!loading ? (
        <VeTokenCalculator
          userBalanceVeSDL={veSdlTokenBalance}
          totalSupplyVeSDL={veSDLTotalSupply}
          open={openCalculator}
          onClose={() => setOpenCalculator(false)}
        />
      ) : (
        <Skeleton width="100px" sx={{ display: "inline-block" }} />
      )}
      <VeSDLWrongNetworkModal />
      <ConfirmModal
        open={unlockConfirmOpen}
        modalText={t("confirmUnlock", {
          penaltyPercent: formatBNToString(penaltyPercent, 18, 3),
        })}
        onOK={() => void unlock()}
        onClose={() => setUnlockConfirmOpen(false)}
      />
    </Container>
  )
}
