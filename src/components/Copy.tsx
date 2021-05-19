import React, { ReactElement } from "react"
import useCopyClipboard from "../hooks/useCopyClipboard"

export default function CopyHelper(props: {
  toCopy: string
  children?: React.ReactNode
}): ReactElement {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <button className="textStyle" onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <>
          {/* Shows check icon after copied */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="buttonGroupIcon"
          >
            <path d="M13.4063 4L12.7 4.7125C10.7532 6.66354 8.67606 8.87808 6.73125 10.8563L4.04375 8.64376L3.26875 8.00625L2 9.55L2.76875 10.1875L6.16875 12.9875L6.875 13.5687L7.5125 12.925C9.6663 10.7666 11.9996 8.24244 14.1125 6.125L14.8188 5.4125L13.4063 4V4Z" />
          </svg>
          <span className="textStyle">Copied!</span>
        </>
      ) : (
        // Shows copy icon when isCopied = false
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="buttonGroupIcon"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.99998 2H12.6667C13.4 2 14 2.6 14 3.33333V10C14 10.7333 13.4 11.3333 12.6667 11.3333H11.2667V12.1333C11.2667 13.1274 10.4608 13.9333 9.46665 13.9333H3.86665C2.87254 13.9333 2.06665 13.1274 2.06665 12.1333V6.53333C2.06665 5.53922 2.87254 4.73333 3.86665 4.73333H4.66665V3.33333C4.66665 2.6 5.25998 2 5.99998 2ZM4.66665 5.93333H3.86665C3.53528 5.93333 3.26665 6.20196 3.26665 6.53333V12.1333C3.26665 12.4647 3.53528 12.7333 3.86665 12.7333H9.46665C9.79802 12.7333 10.0667 12.4647 10.0667 12.1333V11.3333H5.99998C5.25998 11.3333 4.66665 10.7333 4.66665 10V5.93333ZM5.99998 10H12.6667V3.33333H5.99998V10Z"
          />
        </svg>
      )}
      {isCopied ? "" : props.children}
    </button>
  )
}
