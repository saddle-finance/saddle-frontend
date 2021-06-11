import React, { ReactElement, useCallback, useRef, useState } from "react"

import { BigNumber } from "@ethersproject/bignumber"
import SearchSelect from "./SearchSelect"
import { TOKENS_MAP } from "../constants"
import type { TokenOption } from "../pages/Swap"
import classnames from "classnames"
import { commify } from "../utils"
import { formatBNToString } from "../utils"
import styles from "./SwapInput.module.scss"
import useDetectOutsideClick from "../hooks/useDetectOutsideClick"
import { useTranslation } from "react-i18next"

interface Props {
  tokens: TokenOption[]
  selected: string
  inputValue: string
  inputValueUSD: BigNumber
  isSwapFrom: boolean
  onSelect: (tokenSymbol: string) => void
  onChangeAmount?: (value: string) => void
}
export default function SwapInput({
  tokens,
  selected,
  onSelect,
  inputValue,
  inputValueUSD,
  isSwapFrom,
  onChangeAmount,
}: Props): ReactElement {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  useDetectOutsideClick(
    wrapperRef,
    () => setIsDropdownOpen(false),
    isDropdownOpen,
  )
  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value)
      setIsDropdownOpen(false)
    },
    [onSelect],
  )
  const selectedToken = TOKENS_MAP[selected]
  return (
    <div className={styles.swapInputContainer}>
      <div
        className={styles.selectGroup}
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsDropdownOpen((prev) => !prev)
          }
        }}
      >
        {selectedToken && <img src={selectedToken.icon} />}
        <div className={styles.tokenNameContainer}>
          <div className={styles.symbolArrowContainer}>
            <b className={styles.textBoldPurple}>
              {selectedToken ? selectedToken.symbol : t("chooseToken")}
            </b>
            &nbsp;
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.0163 3L6 7.17206L1.98375 3L0.75 4.28441L6 9.75L11.25 4.28441L10.0163 3Z" />
            </svg>
          </div>
          {selectedToken && (
            <p className={styles.textMinor}>{selectedToken.name}</p>
          )}
        </div>
      </div>
      <div
        className={classnames(
          { [styles.focusable]: isSwapFrom },
          styles.inputGroup,
        )}
        onClick={() => {
          inputRef.current?.focus()
        }}
      >
        <input
          ref={inputRef}
          autoComplete="off"
          autoCorrect="off"
          type="text"
          placeholder="0.0"
          spellCheck="false"
          value={isSwapFrom ? inputValue : commify(inputValue)}
          onChange={(e) => {
            // remove all chars that aren't a digit or a period
            const newValue = e.target.value.replace(/[^\d|.]/g, "")
            // disallow more than one period
            if (newValue.indexOf(".") !== newValue.lastIndexOf(".")) return
            onChangeAmount?.(newValue)
          }}
          onFocus={(e: React.ChangeEvent<HTMLInputElement>): void => {
            if (isSwapFrom) {
              e.target.select()
            }
          }}
          readOnly={!isSwapFrom}
          tabIndex={isSwapFrom ? 0 : -1}
        />
        <p className={styles.textMinor}>
          ≈${commify(formatBNToString(inputValueUSD, 18, 2))}
        </p>
      </div>
      {isDropdownOpen && (
        <div className={styles.dropdownContainer} ref={wrapperRef}>
          <SearchSelect tokensData={tokens} onSelect={handleSelect} />
        </div>
      )}
    </div>
  )
}
