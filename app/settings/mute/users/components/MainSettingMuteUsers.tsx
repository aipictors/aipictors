"use client"
import { Box, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingMuteUsers: FC = () => {
  return (
    <Box as={"main"}>
      <Stack p={4}>
        <Text>{"ミュートしているユーザ"}</Text>
      </Stack>
    </Box>
  )
}
