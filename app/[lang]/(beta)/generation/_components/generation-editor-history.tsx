"use client"

import { useSuspenseQuery } from "@apollo/client"
import {
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Stack,
  useDisclosure,
} from "@chakra-ui/react"
import {
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "__generated__/apollo"
import { InPaintingImageModal } from "app/[lang]/(beta)/generation/_components/In-painting-image-modal"
import { GenerationDownloadModal } from "app/[lang]/(beta)/generation/_components/generation-download-modal"
import { GenerationEditorCard } from "app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationHistoryDeleteModal } from "app/[lang]/(beta)/generation/_components/generation-history-delete-modal"
import { SelectedWorkModal } from "app/[lang]/(beta)/generation/_components/selected-work-modal"
import { GenerationHistoryCard } from "app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { TbDownload, TbStar, TbTrash } from "react-icons/tb"

type Props = {
  selectedHistory: string
  selectHistory(history: string): void
}

export const GenerationEditorHistory: React.FC<Props> = (props) => {
  const { data } = useSuspenseQuery<
    ViewerImageGenerationTasksQuery,
    ViewerImageGenerationTasksQueryVariables
  >(ViewerImageGenerationTasksDocument, {
    variables: {
      limit: 64,
      offset: 0,
    },
  })

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
      <GenerationEditorCard title={"生成履歴"}>
        <Box overflowY={"auto"}>
          <HStack p={2}>
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
                onDlOpen()
              }}
            />
            <Button borderRadius={"full"}>{"解除"}</Button>
            <IconButton
              aria-label={"お気に入り"}
              borderRadius={"full"}
              icon={<Icon as={TbStar} />}
            />
          </HStack>
          <Divider />
          <Stack p={2} spacing={4}>
            <SimpleGrid spacing={2} columns={{ base: 1, md: 2 }}>
              {data.viewer?.imageGenerationTasks?.map((task) => (
                <GenerationHistoryCard
                  imageURL={"https://source.unsplash.com/random/800x600"}
                  onClick={() => {
                    onOpen()
                  }}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </Box>
      </GenerationEditorCard>
      <SelectedWorkModal
        isOpen={isOpen}
        onClose={onClose}
        onOpenInPainting={() => {
          onClose()
          onOpenInPainting()
        }}
        onChangeRating={() => {}}
      />
      <InPaintingImageModal
        isOpen={isOpenInPainting}
        onClose={onCloseInPainting}
      />
      <GenerationHistoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />
      <GenerationDownloadModal isOpen={isDlOpen} onClose={onDlClose} />
    </>
  )
}
