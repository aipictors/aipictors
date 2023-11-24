"use client"

import { ViewerImageGenerationTasksQuery } from "@/__generated__/apollo"
import { InPaintingImageDialog } from "@/app/[lang]/(beta)/generation/_components/In-painting-image-dialog"
import { GenerationDownloadDialog } from "@/app/[lang]/(beta)/generation/_components/generation-download-dialog"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationHistoryDeleteDialog } from "@/app/[lang]/(beta)/generation/_components/generation-history-delete-dialog"
import { GenerationHistorySheet } from "@/app/[lang]/(beta)/generation/_components/generation-history-sheet"
import { GenerationHistoryCard } from "@/app/[lang]/(beta)/generation/history/_components/generation-history-card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import { ArrowDownToLine, Star, Trash2 } from "lucide-react"
import { useBoolean } from "usehooks-ts"

type Tasks = NonNullable<
  ViewerImageGenerationTasksQuery["viewer"]
>["imageGenerationTasks"]

type Props = {
  tasks: Tasks
  selectedHistory: string
  selectHistory(history: string): void
}

export const GenerationEditorHistory = (props: Props) => {
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

  const {
    value: isPromptOpen,
    setTrue: onPromptOpen,
    setFalse: onPromptClose,
  } = useBoolean()

  const onOpenPromptConfig = () => {
    onPromptOpen()
    onClose()
  }

  const history = props.tasks?.find((task) => {
    return task.id === props.selectedHistory
  })

  return (
    <>
      <GenerationEditorCard
        title={"生成履歴"}
        action={
          <Button size={"sm"} onClick={onOpen}>
            {"全て見る"}
          </Button>
        }
      >
        {Config.isDevelopmentMode && (
          <div className="flex px-2 pb-2 space-x-2">
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
        )}
        <Separator />
        <ScrollArea>
          <div className="p-2 grid gap-2 grid-cols-1 md:grid-cols-2">
            {props.tasks?.map((task) => (
              <GenerationHistoryCard
                key={task.id}
                taskId={task.id}
                token={task.token}
                onClick={() => {
                  onOpen()
                  props.selectHistory(task.id)
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </GenerationEditorCard>
      {history?.token && (
        <GenerationHistorySheet
          taskId={history.id}
          imageToken={history.token}
          promptText={history.prompt}
          negativePromptText={history.negativePrompt}
          configSeed={history.seed}
          configSampler={history.sampler}
          configScale={history.scale}
          configSizeType={history.sizeType}
          configModel={history.model?.name ?? null}
          configVae={history.vae}
          isOpen={isOpen}
          onClose={onClose}
          onOpenInPainting={() => {
            onClose()
            onOpenInPainting()
          }}
          onChangeRating={() => {}}
        />
      )}
      <InPaintingImageDialog
        isOpen={isOpenInPainting}
        onClose={onCloseInPainting}
      />
      <GenerationHistoryDeleteDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      />
      <GenerationDownloadDialog isOpen={isDlOpen} onClose={onDlClose} />
      {/* <InPaintingSelectedPromptDialog
        isOpen={isPromptOpen}
        onClose={onPromptClose}
      /> */}
    </>
  )
}
