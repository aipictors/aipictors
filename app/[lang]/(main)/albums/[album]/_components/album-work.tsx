"use client"

import {
  Card,
  CardBody,
  HStack,
  Icon,
  IconButton,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import { AlbumWorksQuery } from "@/__generated__/apollo"

import { TbHeart } from "react-icons/tb"

type Props = {
  albumWorksQuery: AlbumWorksQuery
  title: string
  thumbnailImageUrl: string
  likesCount: number
  createdAt: number
}

export const AlbumWork: React.FC<Props> = (props) => {
  return (
    <Card overflow="hidden" variant="outline">
      <HStack justifyContent={"space-between"} pl={4}>
        <Text>{props.title}</Text>
        <IconButton
          aria-label="いいね"
          icon={<Icon as={TbHeart} fontSize={"lg"} />}
          variant={"ghost"}
          borderRadius={"full"}
        />
      </HStack>
      <CardBody>
        <HStack>
          <Image
            src={props.thumbnailImageUrl}
            alt={props.title}
            boxSize={36}
            borderRadius={"md"}
          />
          <Stack>
            <Text py="2">{`いいね数：${props.likesCount}`}</Text>
            <Text py="2">{`閲覧数：${""}`}</Text>
            <Text py="2">{`使用AI：${""}`}</Text>
            <Text py="2">{`投稿時間：${props.createdAt}`}</Text>
          </Stack>
        </HStack>
      </CardBody>
    </Card>
  )
}
