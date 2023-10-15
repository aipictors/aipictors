"use client"

import { Box, HStack, Image, Stack, Text } from "@chakra-ui/react"
import { runAnimation } from "app/[lang]/unknown/utils/runAnimation"
import { useEffect, useRef } from "react"

export const AppAboutHeader: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ref.current === null) return
    runAnimation(ref.current)
  }, [])

  return (
    <Stack
      px={4}
      w={"100%"}
      maxW={"container.xl"}
      mx={"auto"}
      spacing={0}
      pb={32}
      position={"relative"}
    >
      <Box
        position={"absolute"}
        zIndex={-1}
        w={"100%"}
        h={"100%"}
        top={"-8%"}
        right={0}
        left={0}
        opacity={0.2}
      >
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
      <HStack justifyContent={"center"} py={16} position={"relative"}>
        <Image src={"/icon.png"} alt={"icon"} w={64} />
      </HStack>
      <Stack spacing={8}>
        <HStack justifyContent={"center"}>
          <Stack w={"100%"} maxW={"md"} spacing={4}>
            <Text fontWeight={"bold"} fontSize={"3xl"} textAlign={"center"}>
              {"Aipictorsのアプリが登場"}
            </Text>
            <Text>
              {
                "AIイラスト投稿サイト「Aipictors」のSNS機能がアプリになりました。アプリならどこにいても通知を受け取ったりフォローしているクリエーターの作品をチェックできます。"
              }
            </Text>
          </Stack>
        </HStack>
        <HStack alignItems={"center"} justifyContent={"center"} spacing={8}>
          <Image src={"/apple/download.svg"} alt={"download"} h={12} />
          <Image src={"/google/download.png"} alt={"download"} h={16} />
        </HStack>
      </Stack>
    </Stack>
  )
}
