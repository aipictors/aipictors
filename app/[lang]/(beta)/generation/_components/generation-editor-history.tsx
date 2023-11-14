"use client"

import {
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "@/__generated__/apollo"
import { InPaintingImageModal } from "@/app/[lang]/(beta)/generation/_components/In-painting-image-modal"
import { GenerationDownloadModal } from "@/app/[lang]/(beta)/generation/_components/generation-download-modal"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationHistoryDeleteModal } from "@/app/[lang]/(beta)/generation/_components/generation-history-delete-modal"
import { SelectedWorkModal } from "@/app/[lang]/(beta)/generation/_components/selected-work-modal"
import { GenerationHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { useSuspenseQuery } from "@apollo/client"
import {
  Box,
  Button,
  Divider,
  HStack,
  SimpleGrid,
  Stack,
  useDisclosure,
} from "@chakra-ui/react"
import { ArrowDownToLine, Star, Trash2 } from "lucide-react"

type Props = {
  selectedHistory: string
  selectHistory(history: string): void
}

export const GenerationEditorHistory = (props: Props) => {
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
            <Trash2 />
            <ArrowDownToLine />
            <Button borderRadius={"full"}>{"解除"}</Button>
            <Star />
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
