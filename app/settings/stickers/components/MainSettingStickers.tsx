"use client"
import { Box, Button, Icon, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"
import { TbPlus } from "react-icons/tb"

export const MainSettingStickers: FC = () => {
  return (
    <Box as={"main"}>
      <Stack p={4}>
        <Text fontWeight={"bold"}>{"作成済みスタンプ"}</Text>
        <Button leftIcon={<Icon as={TbPlus} />} variant={"ghost"}></Button>
      </Stack>
    </Box>
  )
}
