"use client"
import { Box, HStack, useColorMode } from "@chakra-ui/react"
import { useSearchParams } from "next/navigation"
import { FC, useEffect } from "react"
import { BoxMarkdown } from "components/BoxMarkdown"

type Props = {
  text: string
}

export const MainFlutterTerms: FC<Props> = (props) => {
  const { setColorMode } = useColorMode()

  const searchParams = useSearchParams()

  const prefersColorScheme = searchParams.get("prefers-color-scheme")

  useEffect(() => {
    if (prefersColorScheme === "dark") {
      setColorMode("dark")
    }
    if (prefersColorScheme === "light") {
      setColorMode("light")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <HStack justifyContent={"center"} py={8} minH={"100vh"}>
      <Box
        maxW={"container.sm"}
        mx={"auto"}
        w={"100%"}
        px={{ base: 4, md: 12 }}
      >
        <BoxMarkdown>{props.text}</BoxMarkdown>
      </Box>
    </HStack>
  )
}
