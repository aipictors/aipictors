"use client"
import {
  Card,
  CardBody,
  CardFooter,
  Stack,
  Image,
  Text,
  HStack,
  IconButton,
  Icon,
} from "@chakra-ui/react"
import { TbHeart } from "react-icons/tb"

export const AlbumWork: React.FC = () => {
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      pl={4}
    >
      <Stack>
        <HStack justifyContent={"space-between"}>
          <Text>{"タイトル"}</Text>
          <IconButton
            aria-label="previous month"
            icon={<Icon as={TbHeart} fontSize={"lg"} />}
            variant={"ghost"}
            borderRadius={"full"}
          />
        </HStack>
        <Image
          src="https://bit.ly/dan-abramov"
          alt="Dan Abramov"
          boxSize={36}
        />
      </Stack>
      <Stack>
        <CardBody>
          <Text py="2">{"いいね数："}</Text>
          <Text py="2">{"閲覧数："}</Text>
          <Text py="2">{"使用AI："}</Text>
          <Text py="2">{"投稿時間："}</Text>
        </CardBody>
        <CardFooter />
      </Stack>
    </Card>
  )
}
