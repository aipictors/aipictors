"use client"
import { Avatar, Button, HStack, Stack, Text, Image } from "@chakra-ui/react"

export const UserSupport: React.FC = () => {
  return (
    <HStack justifyContent={"center"}>
      <Stack alignItems={"center"}>
        <Avatar />
        <HStack>
          <Text>{"￥1,000円"}</Text>
          <Button colorScheme="orange" borderRadius={"full"}>
            {"支援する"}
          </Button>
        </HStack>
        <Text>
          {"支援リクエストが承諾されるとお礼画像とともに承諾されます"}
        </Text>
        <Text>{"支援リクエスト管理は、支援管理から確認できます"}</Text>
        <Text>{"使い方はこちら"}</Text>
      </Stack>
      <Image
        src="gibbresh.png"
        fallbackSrc="https://via.placeholder.com/150"
        alt=""
        borderRadius={"md"}
      />
    </HStack>
  )
}
