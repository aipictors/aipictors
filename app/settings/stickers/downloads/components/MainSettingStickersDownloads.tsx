"use client"
import { Box, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingStickersDownloads: FC = () => {
  return (
    <Box as={"main"}>
      <Stack p={4}>
        <Text fontWeight={"bold"}>{"DL済みスタンプ"}</Text>
      </Stack>
    </Box>
  )
}
