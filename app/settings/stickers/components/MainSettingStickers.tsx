"use client"
import { Button, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import { FC } from "react"
import { TbPlus } from "react-icons/tb"

export const MainSettingStickers: FC = () => {
  return (
    <HStack as={"main"} justifyContent={"center"} w={"100%"}>
      <Stack maxW={"container.sm"} w={"100%"} p={4} spacing={8}>
        <Text fontWeight={"bold"} fontSize={"2xl"}>
          {"作成済みスタンプ"}
        </Text>
        <HStack>
          <Button
            aria-label="add stickers"
            rightIcon={<Icon as={TbPlus} />}
            size={"lg"}
          >
            {"新しいスタンプ"}
          </Button>
        </HStack>
      </Stack>
    </HStack>
  )
}
