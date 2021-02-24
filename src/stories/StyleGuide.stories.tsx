import "../styles/global.scss"

import { Button, Heading, Stack, Text } from "@chakra-ui/react"
import React, { ReactElement } from "react"

const Headings = () => (
  <Stack spacing={6}>
    <Heading as="h1" size="4xl" isTruncated>
      {`(4xl) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h2" size="3xl" isTruncated>
      {`(3xl) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h2" size="2xl">
      {`(2xl) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h2" size="xl">
      {`(xl) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h3" size="lg">
      {`(lg) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h4" size="md">
      {`(md) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h5" size="sm">
      {`(sm) It's time to Saddle Up!`}
    </Heading>
    <Heading as="h6" size="xs">
      {`(xs) It's time to Saddle Up!`}
    </Heading>
  </Stack>
)

const Texts = () => (
  <Stack spacing={3}>
    <Text fontSize="6xl">{`(6xl) It's time to Saddle Up!`}</Text>
    <Text fontSize="5xl">{`(5xl) It's time to Saddle Up!`}</Text>
    <Text fontSize="4xl">{`(4xl) It's time to Saddle Up!`}</Text>
    <Text fontSize="3xl">{`(3xl) It's time to Saddle Up!`}</Text>
    <Text fontSize="2xl">{`(2xl) It's time to Saddle Up!`}</Text>
    <Text fontSize="xl">{`(xl) It's time to Saddle Up!`}</Text>
    <Text fontSize="lg">{`(lg) It's time to Saddle Up!`}</Text>
    <Text fontSize="md">{`(md) It's time to Saddle Up!`}</Text>
    <Text fontSize="sm">{`(sm) It's time to Saddle Up!`}</Text>
    <Text fontSize="xs">{`(xs) It's time to Saddle Up!`}</Text>
  </Stack>
)

const Buttons = () => (
  <Stack spacing={8} direction="row" align="center">
    <Stack spacing={4}>
      Variant: Primary
      <Button variant="primary" size="lg">
        Button
      </Button>
      <Button variant="primary" size="lg" disabled>
        Button
      </Button>
    </Stack>
  </Stack>
)
export const StyleGuide = (): ReactElement => (
  <Stack spacing={4}>
    <Heading as="h2" size="2xl">
      Headings
    </Heading>
    <Headings />
    <Heading as="h2" size="2xl">
      Texts
    </Heading>
    <Texts />
    <Heading as="h2" size="2xl">
      Buttons
    </Heading>
    <Buttons />
  </Stack>
)

export default {
  title: "StyleGuide",
  component: StyleGuide,
}
