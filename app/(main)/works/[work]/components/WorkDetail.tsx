"use client"
import {
  Button,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  TbDots,
  TbFolderFilled,
  TbHeartFilled,
  TbQuestionMark,
  TbShare2,
} from "react-icons/tb"
import type { WorkQuery } from "__generated__/apollo"

type Props = {
  workQuery: WorkQuery
}

export const WorkDetail: React.FC<Props> = (props) => {
  return (
    <Stack>
      <Image
        w={"100%"}
        h={"100%"}
        objectFit={"cover"}
        borderRadius={"md"}
        alt={""}
        src={props.workQuery.work?.image?.downloadURL}
      />
      <HStack justifyContent={"space-between"}>
        <HStack>
          <Button leftIcon={<Icon as={TbQuestionMark} />} borderRadius={"full"}>
            {"参考作品として使用"}
          </Button>
        </HStack>
        <HStack>
          <Button leftIcon={<Icon as={TbFolderFilled} />} borderRadius={"full"}>
            {"ブックマーク"}
          </Button>
          <Button leftIcon={<Icon as={TbHeartFilled} />} borderRadius={"full"}>
            <HStack spacing={2}>
              <Text>{"いいね"}</Text>
              <Text>{props.workQuery.work?.likesCount}</Text>
            </HStack>
          </Button>
          <Button leftIcon={<Icon as={TbShare2} />} borderRadius={"full"}>
            {"シェア"}
          </Button>
          <IconButton
            aria-label={"メニュー"}
            borderRadius={"full"}
            icon={<Icon as={TbDots} />}
          />
        </HStack>
      </HStack>
      <Text fontSize={"lg"} fontWeight={"bold"}>
        {props.workQuery.work?.title}
      </Text>
      <Text>{props.workQuery.work?.description}</Text>
      <Text>{props.workQuery.work?.createdAt}</Text>
    </Stack>
  )
}
