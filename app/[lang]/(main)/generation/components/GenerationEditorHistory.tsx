"use client"

import {
  Button,
  Card,
  HStack,
  Icon,
  IconButton,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { TbDownload, TbStar, TbTrash } from "react-icons/tb"
import { GenerationHistoryDeleteModal } from "app/[lang]/(main)/generation/components/GenerationHistoryDeleteModal"
import { GenerationHistoryDlModal } from "app/[lang]/(main)/generation/components/GenerationHistoryDlModal"
import { InPaintingImageModal } from "app/[lang]/(main)/generation/components/InPaintingImageModal"
import { SelectedWorkModal } from "app/[lang]/(main)/generation/components/SelectedWorkModal"

type Props = {
  selectedHistory: string
  selectHistory(history: string): void
}

export const GenerationEditorHistory: React.FC<Props> = (props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const {
    isOpen: isDlOpen,
    onOpen: onDlOpen,
    onClose: onDlClose,
  } = useDisclosure()

  const {
    isOpen: isOpenInPainting,
    onOpen: onOpenInPainting,
    onClose: onCloseInPainting,
  } = useDisclosure()

  return (
    <>
      <Card p={4} h={"100%"}>
        <Text fontWeight={"bold"}>{"生成履歴"}</Text>
        <Stack>
          <HStack>
            <Text fontWeight={"bold"}>{"全件/3日前"}</Text>
            <IconButton
              aria-label={"削除"}
              borderRadius={"full"}
              icon={<Icon as={TbTrash} />}
              onClick={onDeleteOpen}
            />
            <IconButton
              aria-label={"ダウンロード"}
              borderRadius={"full"}
              icon={<Icon as={TbDownload} />}
              onClick={() => {
                onDlOpen
                props.selectHistory(props.selectedHistory)
              }}
            />
            <Button borderRadius={"full"}>{"解除"}</Button>
            <IconButton
              aria-label={"お気に入り"}
              borderRadius={"full"}
              icon={<Icon as={TbStar} />}
            />
          </HStack>
          <SimpleGrid spacing={2} columns={{ base: 3, md: 4 }} py={4}>
            <Card>
              <Button
                p={0}
                h={"auto"}
                overflow={"hidden"}
                variant={"outline"}
                borderWidth={2}
                borderColor={"blue.500"}
                onClick={() => {
                  onOpen()
                }}
              >
                <Image
                  src="https://source.unsplash.com/random/800x600"
                  alt=""
                  boxSize={28}
                  draggable={false}
                />
              </Button>
            </Card>
          </SimpleGrid>
        </Stack>
      </Card>
      <SelectedWorkModal
        isOpen={isOpen}
        onClose={onClose}
        onOpenInPainting={() => {
          onClose()
          onOpenInPainting()
        }}
        onChangeRating={(value) => {
          console.log(value)
        }}
      />
      <InPaintingImageModal
        isOpen={isOpenInPainting}
        onClose={onCloseInPainting}
      />
      <GenerationHistoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />
      <GenerationHistoryDlModal isOpen={isDlOpen} onClose={onDlClose} />
    </>
  )
}
