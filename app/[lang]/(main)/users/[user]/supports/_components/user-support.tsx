"use client"

import { Avatar, Button, HStack, Image, Stack, Text } from "@chakra-ui/react"
import type { UserQuery } from "__generated__/apollo"

type Props = {
  user: NonNullable<UserQuery["user"]>
  userIconImageURL: string | null
  userName: string
}

/**
 * 支援リクエスト
 * @param props
 * @returns
 */
export const UserSupport: React.FC<Props> = (props) => {
  return (
    <HStack justifyContent={"center"}>
      <Stack alignItems={"center"}>
        <Avatar name={props.userName} src={props.userIconImageURL ?? ""} />
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
        alt=""
        borderRadius={"md"}
        fallbackSrc="https://via.placeholder.com/150"
      />
    </HStack>
  )
}
