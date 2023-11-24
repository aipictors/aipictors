"use client"

import {
  ViewerImageGenerationTasksDocument,
  ViewerImageGenerationTasksQuery,
  ViewerImageGenerationTasksQueryVariables,
} from "@/__generated__/apollo"
import { InPaintingImageDialog } from "@/app/[lang]/(beta)/generation/_components/In-painting-image-dialog"
import { GenerationDownloadDialog } from "@/app/[lang]/(beta)/generation/_components/generation-download-dialog"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationHistoryDeleteDialog } from "@/app/[lang]/(beta)/generation/_components/generation-history-delete-dialog"
import { SelectedWorkDialog } from "@/app/[lang]/(beta)/generation/_components/selected-work-dialog"
import { GenerationHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { AppContext } from "@/app/_contexts/app-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { skipToken, useSuspenseQuery } from "@apollo/client"
import { ArrowDownToLine, Star, Trash2 } from "lucide-react"
import { useContext } from "react"
import { useBoolean } from "usehooks-ts"

type Props = {
  selectedHistory: string
  selectHistory(history: string): void
}

export const GenerationEditorHistory = (props: Props) => {
  const appContext = useContext(AppContext)

  const { data } = useSuspenseQuery<
    ViewerImageGenerationTasksQuery,
    ViewerImageGenerationTasksQueryVariables
  >(
    ViewerImageGenerationTasksDocument,
    appContext.isLoggedIn
      ? {
          variables: {
            limit: 64,
            offset: 0,
          },
        }
      : skipToken,
  )

  console.log(data)

  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const {
    value: isDeleteOpen,
    setTrue: onDeleteOpen,
    setFalse: onDeleteClose,
  } = useBoolean()

  const {
    value: isDlOpen,
    setTrue: onDlOpen,
    setFalse: onDlClose,
  } = useBoolean()

  const {
    value: isOpenInPainting,
    setTrue: onOpenInPainting,
    setFalse: onCloseInPainting,
  } = useBoolean()

  if (typeof data === "undefined") {
    return null
  }

  return (
    <>
      <GenerationEditorCard title={"生成履歴"}>
        <div className="overflow-y-auto space-y-2">
          <div className="flex px-2 space-x-2">
            <Button disabled variant={"secondary"}>
              {"解除"}
            </Button>
            <Button
              disabled
              variant={"ghost"}
              size={"icon"}
              onClick={onDeleteOpen}
            >
              <Trash2 className="w-4" />
            </Button>
            <Button disabled variant={"ghost"} size={"icon"} onClick={onDlOpen}>
              <ArrowDownToLine className="w-4" />
            </Button>
            <Button disabled variant={"ghost"} size={"icon"}>
              <Star className="w-4" />
            </Button>
          </div>
          <Separator />
          <div className="p-2 space-y-4">
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
              {data.viewer?.imageGenerationTasks?.map((task) => (
                <GenerationHistoryCard
                  imageURL={"https://source.unsplash.com/random/800x600"}
                  onClick={() => {
                    onOpen()
                    props.selectHistory(task.id)
                  }}
                  key={task.id}
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
      <GenerationDownloadDialog isOpen={isDlOpen} onClose={onDlClose} />
    </>
  )
}
