"use client"

import {
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "@/__generated__/apollo"
import { InPaintingImageDialog } from "@/app/[lang]/(beta)/generation/_components/In-painting-image-dialog"
import { GenerationDownloadModal } from "@/app/[lang]/(beta)/generation/_components/generation-download-modal"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationHistoryDeleteDialog } from "@/app/[lang]/(beta)/generation/_components/generation-history-delete-dialog"
import { SelectedWorkDialog } from "@/app/[lang]/(beta)/generation/_components/selected-work-dialog"
import { GenerationHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSuspenseQuery } from "@apollo/client"
import { useDisclosure } from "@chakra-ui/react"
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
        <div className="overflow-y-auto">
          <div className="flex p-2">
            <Trash2 />
            <ArrowDownToLine />
            <Button className="border-radius-full">{"解除"}</Button>
            <Star />
          </div>
          <Separator className="my-4" />
          <div className="p-2 space-y-4">
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
              {data.viewer?.imageGenerationTasks?.map((task) => (
                <GenerationHistoryCard
                  imageURL={"https://source.unsplash.com/random/800x600"}
                  onClick={() => {
                    onOpen()
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </GenerationEditorCard>
      <SelectedWorkDialog
        isOpen={isOpen}
        onClose={onClose}
        onOpenInPainting={() => {
          onClose()
          onOpenInPainting()
        }}
        onChangeRating={() => {}}
      />
      <InPaintingImageDialog
        isOpen={isOpenInPainting}
        onClose={onCloseInPainting}
      />
      <GenerationHistoryDeleteDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />
      <GenerationDownloadModal isOpen={isDlOpen} onClose={onDlClose} />
    </>
  )
}
