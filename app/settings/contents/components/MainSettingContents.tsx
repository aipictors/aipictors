"use client"
import { Box, Button, HStack, Stack, Switch, Text } from "@chakra-ui/react"
import { FC } from "react"

export const MainSettingContents: FC = () => {
  return (
    <Box as={"main"} maxW={"sm"}>
      <Stack p={4}>
        <Text fontWeight={"bold"}>{"非表示対象"}</Text>
        <HStack justifyContent={"space-between"}>
          <Text>{"R-18"}</Text>
          <Switch />
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text>{"R-18G"}</Text>
          <Switch />
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text>{"性的描写（軽度な描写も含む）"}</Text>
          <Switch />
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text>{"全年齢"}</Text>
          <Switch />
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text>
            {"宣伝など作品に関係のない可能性のあるキャプションは非表示"}
          </Text>
          <Switch />
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text>{"宣伝の可能性のある作品は非表示"}</Text>
          <Switch />
        </HStack>
        <HStack justifyContent={"space-between"}>
          <Text>{"センシティブなコンテンツを表示する（メンテナンス中）"}</Text>
          <Switch />
        </HStack>
      </Stack>
      <Stack>
        <Button colorScheme="primary" borderRadius={"full"}>
          {"変更を保存"}
        </Button>
      </Stack>
    </Box>
  )
}
