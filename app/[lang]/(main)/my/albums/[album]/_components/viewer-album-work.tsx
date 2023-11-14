"use client"

import { AlbumWorkDeleteModal } from "@/app/[lang]/(main)/my/albums/[album]/_components/album-work-delete-modal"
import {
  Button,
  Card,
  CardBody,
  HStack,
  Image,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Trash2 } from "lucide-react"

export const ViewerAlbumWork = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card overflow="hidden" variant="outline">
        <Button
          p={0}
          h={"auto"}
          overflow={"hidden"}
          variant={"outline"}
          borderWidth={2}
          minW={"sm"}
        >
          <CardBody>
            <HStack justifyContent={"space-between"} spacing={4}>
              <Text>{"タイトル"}</Text>
              <Trash2 />
            </HStack>
            <HStack>
              <Image
                src="https://bit.ly/dan-abramov"
                alt="Dan Abramov"
                boxSize={36}
                borderRadius={"md"}
              />
              <Stack spacing={4}>
                <Text>{"いいね数："}</Text>
                <Text>{"閲覧数："}</Text>
                <Text whiteSpace={"pre-wrap"}>{"使用AI："}</Text>
                <Text whiteSpace={"pre-wrap"}>{"投稿時間："}</Text>
              </Stack>
            </HStack>
          </CardBody>
        </Button>
      </Card>
      <AlbumWorkDeleteModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
