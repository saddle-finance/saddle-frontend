import * as React from "react"

import {
  ChakraProvider,
  Flex,
  IconButton,
  extendTheme,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react"

import chakraTheme from "../src/theme/"

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
}

/**
 * Add global context for RTL-LTR switching
 */
export const globalTypes = {
  direction: {
    name: "Direction",
    description: "Direction for layout",
    defaultValue: "LTR",
    toolbar: {
      icon: "globe",
      items: ["LTR", "RTL"],
    },
  },
}

const ColorModeToggleBar = () => {
  const { toggleColorMode } = useColorMode()
  const icon = useColorModeValue("☾ mode", "☀ mode")
  const nextMode = useColorModeValue("dark", "light")

  return (
    <Flex justify="flex-end" mb={4}>
      <IconButton
        size="md"
        fontSize="lg"
        aria-label={`Switch to ${nextMode} mode`}
        variant="ghost"
        color="current"
        marginLeft="2"
        onClick={toggleColorMode}
        icon={<div>{icon}</div>}
      />
    </Flex>
  )
}

const withChakra = (StoryFn, context) => {
  const { direction } = context.globals
  const dir = direction.toLowerCase()
  return (
    <ChakraProvider theme={extendTheme({ ...chakraTheme, direction: dir })}>
      <div dir={dir} id="story-wrapper" style={{ minHeight: "100vh" }}>
        <ColorModeToggleBar />
        <StoryFn />
      </div>
    </ChakraProvider>
  )
}

export const decorators = [withChakra]
