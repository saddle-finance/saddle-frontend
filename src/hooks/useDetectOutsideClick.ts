import { RefObject, useEffect } from "react"

export default function useDetectOutsideClick(
  elementRef: RefObject<HTMLElement>,
  callback: () => void,
  active: boolean,
): void {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        active &&
        elementRef?.current &&
        !elementRef?.current.contains(event.target as Node)
      ) {
        event.preventDefault()
        event.stopPropagation()
        callback()
      }
    }
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        callback()
      }
    }

    if (active) {
      document.addEventListener("keydown", handleKeyPress, true)
      document.addEventListener("click", handleClick, true)
    }

    return () => {
      document.addEventListener("keydown", handleKeyPress, true)
      document.removeEventListener("click", handleClick, true)
    }
  }, [active, callback, elementRef])
}
