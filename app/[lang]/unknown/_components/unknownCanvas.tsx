"use client"
import { Box, Stack, Text } from "@chakra-ui/react"
import { runAnimation } from "app/[lang]/unknown/_utils/runAnimation"
import { useEffect, useRef } from "react"

export const UnknownCanvas: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ref.current === null) return
    runAnimation(ref.current)
  }, [])

  return (
    <Box h={"100svh"} w={"100%"}>
      <Stack
        position={"absolute"}
        w={"100%"}
        h={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Text
          fontWeight={"bold"}
          fontSize={"4xl"}
          fontFamily={"'Pixelify Sans', cursive"}
        >
          {"Aipictors!"}
        </Text>
      </Stack>
      <canvas
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          touchAction: "none",
        }}
      />
    </Box>
  )
}
