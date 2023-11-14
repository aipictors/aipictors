"use client"

import {
  Card,
  CardBody,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react"
import { Heart } from "lucide-react"

export const SensitiveAlbumWork = () => {
  return (
    <Card overflow="hidden" variant="outline">
      <HStack justifyContent={"space-between"} pl={4}>
        <Text>{"タイトル"}</Text>
        <IconButton
          aria-label="previous month"
          icon={<Heart fontSize={"lg"} />}
          variant={"ghost"}
          borderRadius={"full"}
        />
      </HStack>
      <CardBody>
        <HStack>
          <Image
            src="https://bit.ly/dan-abramov"
            alt="Dan Abramov"
            boxSize={36}
            borderRadius={"md"}
          />
          <Stack>
            <Text py="2">{"いいね数："}</Text>
            <Text py="2">{"閲覧数："}</Text>
            <Text py="2">{"使用AI："}</Text>
            <Text py="2">{"投稿時間："}</Text>
          </Stack>
        </HStack>
      </CardBody>
    </Card>
  )
}
