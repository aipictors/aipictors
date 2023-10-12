"use client"
import {
  Avatar,
  Card,
  CardBody,
  HStack,
  Icon,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { TbSettings } from "react-icons/tb"
import { DescriptionSettingModal } from "app/[lang]/(main)/viewer/albums/[album]/components/DescriptionSettingModal"

export const ViewerAlbumWorkDescription: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Card overflow="hidden" variant="outline" size={"lg"} boxSize={52}>
        <CardBody>
          <Stack spacing={4}>
            <HStack justifyContent={"space-between"} alignItems={"center"}>
              <HStack>
                <Avatar src="https://bit.ly/broken-link" size={"sm"} />
                <Text>{"name"}</Text>
              </HStack>
              <IconButton
                size={"md"}
                aria-label={"変更"}
                borderRadius={"full"}
                icon={<Icon as={TbSettings} />}
                onClick={onOpen}
              />
            </HStack>
            <HStack justifyContent={"flex-start"}></HStack>
            <Text>{"説明"}</Text>
          </Stack>
        </CardBody>
      </Card>
      <DescriptionSettingModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}
