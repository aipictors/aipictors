"use client"
import {
  Avatar,
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
import { toDateTimeText } from "app/utils/toDateTimeText"

type Props = {
  work: NonNullable<WorkQuery["work"]>
}

export const WorkArticle: React.FC<Props> = (props) => {
  return (
    <Stack as="article">
      <Image
        w={"100%"}
        h={"100%"}
        objectFit={"cover"}
        borderRadius={"md"}
        alt={""}
        src={props.work.image?.downloadURL}
      />
      {props.work.subWorks.map((subWork) => (
        <Image
          key={subWork.id}
          w={"100%"}
          h={"100%"}
          borderRadius={"md"}
          alt={""}
          src={subWork.image?.downloadURL}
        />
      ))}
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
              <Text>{props.work.likesCount}</Text>
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
        {props.work.title}
      </Text>
      <Text>{props.work.description}</Text>
      <Text fontSize={"sm"}>{toDateTimeText(props.work.createdAt)}</Text>
      <Text>{props.work.tagNames}</Text>
      <HStack justifyContent={"space-between"}>
        <HStack>
          <Avatar src={props.work.user.iconImage?.downloadURL} />
          <Text>{props.work.user.name}</Text>
          <Button colorScheme={"primary"} borderRadius={"full"} size={"sm"}>
            {"フォローする"}
          </Button>
        </HStack>
        <Text fontSize={"sm"}>{"一覧をダイアログで見る"}</Text>
      </HStack>
      <HStack overflowX={"auto"}>
        {props.work.user.works.map((work) => (
          <Image
            key={work.id}
            h={40}
            borderRadius={"md"}
            alt={""}
            src={work.thumbnailImage?.downloadURL}
          />
        ))}
      </HStack>
    </Stack>
  )
}
