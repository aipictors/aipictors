"use client"
import {
  Card,
  CardBody,
  Stack,
  Image,
  Text,
  HStack,
  IconButton,
  Icon,
  Button,
  useDisclosure,
} from "@chakra-ui/react"
import { TbTrash } from "react-icons/tb"
import { AlbumWorkDeleteModal } from "app/[lang]/(main)/viewer/albums/[album]/components/AlbumWorkDeleteModal"

export const ViewerAlbumWork: React.FC = () => {
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
              <IconButton
                aria-label={"削除"}
                icon={<Icon as={TbTrash} fontSize={"lg"} />}
                variant={"ghost"}
                borderRadius={"full"}
                onClick={onOpen}
              />
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
