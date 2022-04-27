import React, { ImgHTMLAttributes } from "react"
import { getTokenIconPath } from "../utils"

interface Props {
  symbol: string
}

export default function TokenIcon({
  symbol,
  width = 24,
  height = 24,
  ...props
}: Props & ImgHTMLAttributes<HTMLImageElement>): JSX.Element {
  return (
    <img
      className="tokenIcon"
      src={getTokenIconPath(symbol)}
      onError={handleTokenIconImageError}
      {...props}
      width={width}
      height={height}
    />
  )
}

/** Update the img tag's src to the default "unknown" icon if svg file is not found
 *
 * @param event The event object of the onError attribute within the img tag
 */
function handleTokenIconImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
): void {
  event.currentTarget.src = getTokenIconPath("unknown")
}
