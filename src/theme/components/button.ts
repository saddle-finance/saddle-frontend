import {
  CSSWithMultiValues,
  RecursiveCSSObject,
} from "@chakra-ui/styled-system"

import { Dict } from "@chakra-ui/utils"
import { transparentize } from "@chakra-ui/theme-tools"

const variantPrimary = (
  props: Dict,
): RecursiveCSSObject<CSSWithMultiValues> => {
  const transparentColor = transparentize("gray.500", 0.4)(props.theme)
  const disabled = {
    opacity: "1",
    color: transparentColor,
    bg: "teal.500",
  }
  return {
    color: "black",
    bg: "teal.500",
    _hover: {
      color: "white",
      bg: "purple.500",
      _disabled: disabled,
    },
    _active: {
      color: "white",
      bg: "purple.500",
    },
    _disabled: disabled,
  }
}

const variants = {
  primary: variantPrimary,
}
export default { variants }
