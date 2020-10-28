import { useEffect, useRef } from "react"

// Source: https://github.com/austintgriffith/eth-hooks/blob/master/src/Poller.ts

const usePoller = (fn: () => void, delay: number): void => {
  const savedCallback = useRef<() => void>()

  // Remember the latest fn.
  useEffect((): void => {
    savedCallback.current = fn
  }, [fn])

  // Set up the interval.
  useEffect((): void | (() => void) => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    function tick() {
      if (savedCallback.current) savedCallback.current()
    }

    if (delay !== null) {
      const id = setInterval(tick, delay)
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      return () => clearInterval(id)
    }
  }, [delay])

  // run at start too
  useEffect(() => {
    fn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default usePoller
