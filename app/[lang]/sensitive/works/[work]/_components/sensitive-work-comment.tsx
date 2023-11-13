"use client"
import { toDateTimeText } from "@/app/_utils/to-date-time-text"
import { Avatar, HStack, Image, Stack, Text } from "@chakra-ui/react"

type Props = {
  userIconImageURL?: string
  userName?: string
  text?: string
  stickerImageURL?: string
  createdAt: number
}

export const SensitiveWorkComment: React.FC<Props> = (props) => {
  return (
    <HStack alignItems={"flex-start"}>
      <Avatar src={props.userIconImageURL} />
      <Stack spacing={0}>
        <Text>{props.userName}</Text>
        {props.text && <Text>{props.text}</Text>}
        {props.stickerImageURL && (
          <Image w={32} alt={""} src={props.stickerImageURL} />
        )}
        <HStack>
          <Text fontSize={"xs"}>{toDateTimeText(props.createdAt)}</Text>
          <Text fontSize={"xs"}>{"返信"}</Text>
          <Text fontSize={"xs"}>{"ダウンロード"}</Text>
        </HStack>
      </Stack>
    </HStack>
  )
}
