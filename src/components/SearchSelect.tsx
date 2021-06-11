import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import Divider from "./Divider"
import { SWAP_TYPES } from "../constants"
import type { TokenOption } from "../pages/Swap"
import classnames from "classnames"
import { commify } from "../utils"
import { formatBNToString } from "../utils"
import styles from "./SearchSelect.module.scss"
import { useTranslation } from "react-i18next"

interface Props {
  tokensData: TokenOption[]
  onSelect: (symbol: string) => void
  value?: string
}

export default function SearchSelect({
  tokensData,
  onSelect,
}: Props): ReactElement {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const focusedItemRef = useRef<HTMLLIElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (inputRef?.current != null) {
      inputRef.current.focus()
    }
  }, [inputRef])
  useEffect(() => {
    // scroll active li into view if user got there via keyboard nav
    if (focusedItemRef?.current != null) {
      focusedItemRef.current.scrollIntoView()
    }
  }, [focusedItemRef, activeIndex])
  const filteredTokens = useMemo(() => {
    // filter tokens by user input
    return tokensData.filter(({ symbol, name }) => {
      const target = searchTerm.toLowerCase()
      return (
        symbol.toLowerCase().includes(target) ||
        name.toLowerCase().includes(target)
      )
    })
  }, [tokensData, searchTerm])
  const lastSelectableIndex = useMemo(() => {
    // find the last idx of isAvailable tokens
    const lastAvailableIndex =
      filteredTokens.findIndex(({ isAvailable }) => isAvailable === false) - 1
    return lastAvailableIndex < 0
      ? filteredTokens.length - 1
      : lastAvailableIndex
  }, [filteredTokens])

  return (
    <div className={styles.searchSelect}>
      <div className={styles.inputContainer}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
            fill="#B1B1B1"
          />
        </svg>

        <input
          value={searchTerm}
          onChange={(e) => {
            const inputValue = e.target.value
            const nextActiveIndex = inputValue === "" ? null : 0
            activeIndex !== nextActiveIndex && setActiveIndex(nextActiveIndex)
            setSearchTerm(inputValue)
          }}
          ref={inputRef}
          onFocus={() => activeIndex != null && setActiveIndex(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && activeIndex != null) {
              const token = filteredTokens[activeIndex]
              token.isAvailable && onSelect(token.symbol)
            } else if (e.key === "ArrowUp") {
              setActiveIndex((prev) =>
                prev === null || prev === 0 ? null : Math.max(0, prev - 1),
              )
            } else if (e.key === "ArrowDown") {
              setActiveIndex((prev) =>
                prev === null ? 0 : Math.min(lastSelectableIndex, prev + 1),
              )
            }
          }}
        />
      </div>
      <ul className={styles.listContainer}>
        {filteredTokens.map((item, i) => {
          return (
            <li
              key={item.symbol}
              onClick={() => item.isAvailable && onSelect(item.symbol)}
              ref={i === activeIndex ? focusedItemRef : null}
            >
              <Divider />
              <ListItem {...item} isActive={i === activeIndex} />
            </li>
          )
        })}
        {filteredTokens.length === 0 ? (
          <li className={styles.listItem}>{t("noTokensFound")}</li>
        ) : null}
      </ul>
    </div>
  )
}

function ListItem({
  amount,
  valueUSD,
  name,
  icon,
  symbol,
  decimals,
  isActive,
  isAvailable,
  swapType,
}: TokenOption & { isActive: boolean }) {
  const { t } = useTranslation()
  const isVirtualSwap = ([
    SWAP_TYPES.SYNTH_TO_SYNTH,
    SWAP_TYPES.SYNTH_TO_TOKEN,
    SWAP_TYPES.TOKEN_TO_SYNTH,
    SWAP_TYPES.TOKEN_TO_TOKEN,
  ] as Array<SWAP_TYPES | null>).includes(swapType)
  return (
    <div
      className={classnames(styles.listItem, {
        [styles.isActive]: isActive,
        [styles.isUnavailable]: !isAvailable,
        [styles.isAvailable]: isAvailable,
      })}
    >
      <img src={icon} height="24px" width="24px" />
      <div>
        <div className={styles.tagWrapper}>
          <b>{symbol}</b>
          {!isAvailable && (
            <span className={styles.unavailableTag}>{t("unavailable")}</span>
          )}
          {isAvailable && isVirtualSwap && (
            <span className={styles.virtualSwapTag}>{t("virtualSwap")}</span>
          )}
        </div>
        <p className={styles.textMinor}>{name}</p>
      </div>
      <div>
        <p>{commify(formatBNToString(amount, decimals))}</p>
        <p className={styles.textMinor}>
          ≈${commify(formatBNToString(valueUSD, 18, 2))}
        </p>
      </div>
    </div>
  )
}
