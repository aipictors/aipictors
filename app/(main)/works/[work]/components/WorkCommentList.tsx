"use client"
import {
  Avatar,
  Button,
  HStack,
  Icon,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { TbRubberStamp } from "react-icons/tb"
import type { WorkQuery } from "__generated__/apollo"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

export const WorkCommentList: React.FC<Props> = (props) => {
  return (
    <Stack>
      <Text>{"コメント"}</Text>
      <HStack>
        <Avatar src={""} />
        <Input size={"sm"} placeholder="コメントする" borderRadius={"full"} />
        <IconButton
          aria-label={"スタンプ"}
          borderRadius={"full"}
          icon={<Icon as={TbRubberStamp} />}
          size={"sm"}
        />
        <Button colorScheme={"primary"} borderRadius={"full"} size={"sm"}>
          {"投稿"}
        </Button>
      </HStack>
    </Stack>
  )
}
