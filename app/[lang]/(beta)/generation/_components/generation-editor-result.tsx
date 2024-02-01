"use client"

import { InPaintingImageForm } from "@/app/[lang]/(beta)/generation/_components/In-painting-image-form"
import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationResultSheet } from "@/app/[lang]/(beta)/generation/_components/generation-result-sheet"
import { GenerationResultCard } from "@/app/[lang]/(beta)/generation/results/_components/generation-result-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Config } from "@/config"
import { ViewerImageGenerationTasksQuery } from "@/graphql/__generated__/graphql"
import { ArrowDownToLineIcon, StarIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useBoolean } from "usehooks-ts"
type Tasks = NonNullable<
  ViewerImageGenerationTasksQuery["viewer"]
>["imageGenerationTasks"]

type Props = {
  tasks: Tasks
  userNanoid: string | null
  onChangeSampler(sampler: string): void
  onChangeScale(scale: number): void
  onChangeSeed(seed: number): void
  onChangeSize(size: string): void
  onChangeVae(vae: string | null): void
  onChangePromptText(prompt: string): void
  onChangeNegativePromptText(prompt: string): void
}

export const GenerationEditorResult = (props: Props) => {
  const { value: isOpen, setTrue: onOpen, setFalse: onClose } = useBoolean()

  const [selectedHistory, selectHistory] = useState<null | string>(null)

  const {
    value: isOpenInPainting,
    setTrue: onOpenInPainting,
    setFalse: onCloseInPainting,
  } = useBoolean()

  const onUseConfig = () => {
    if (typeof history === "undefined") return
    props.onChangeSampler(history.sampler)
    props.onChangeScale(history.scale)
    props.onChangeSeed(history.seed)
    props.onChangeSize(history.sizeType)
    props.onChangeVae(history.vae)
    props.onChangePromptText(history.prompt)
    props.onChangeNegativePromptText(history.negativePrompt)
    onClose()
    toast("設定を復元しました")
  }

  const history = props.tasks.find((task) => {
    return task.id === selectedHistory
  })

  return (
    <>
      <GenerationEditorCard
        title={"生成履歴"}
        action={
          <Button variant={"secondary"} size={"sm"}>
            {"全て見る"}
          </Button>
        }
      >
        {Config.isDevelopmentMode && (
          <div className="flex px-2 pb-2 space-x-2">
            <Button disabled variant={"secondary"}>
              {"解除"}
            </Button>
            <Button disabled variant={"ghost"} size={"icon"}>
              <Trash2Icon className="w-4" />
            </Button>
            <Button disabled variant={"ghost"} size={"icon"}>
              <ArrowDownToLineIcon className="w-4" />
            </Button>
            <Button disabled variant={"ghost"} size={"icon"}>
              <StarIcon className="w-4" />
            </Button>
          </div>
        )}
        <Separator />
        <ScrollArea>
          <div className="p-2 grid gap-2 grid-cols-1 md:grid-cols-2">
            {props.tasks
              ?.filter(
                (task) =>
                  !task.isDeleted &&
                  (task.status === "IN_PROGRESS" || task.status === "DONE"),
              )
              .map((task) => (
                <GenerationResultCard
                  key={task.id}
                  taskId={task.id}
                  token={task.token}
                  onClick={() => {
                    selectHistory(task.id)
                    onOpen()
                  }}
                />
              ))}
          </div>
        </ScrollArea>
      </GenerationEditorCard>
      {history?.token && (
        <GenerationResultSheet
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
          onUse={onUseConfig}
          onOpenInPainting={() => {
            onOpenInPainting()
          }}
          onChangeRating={() => {}}
        />
      )}
      {history?.token && (
        <Dialog onOpenChange={onCloseInPainting} open={isOpenInPainting}>
          <DialogContent>
            <InPaintingImageForm
              isOpen={isOpenInPainting}
              onClose={onCloseInPainting}
              taskId={history?.id ?? ""}
              token={history?.token ?? ""}
              userNanoid={props.userNanoid}
              configSeed={history.seed}
              configSampler={history.sampler}
              configScale={history.scale}
              configSteps={history.steps}
              configSizeType={history.sizeType}
              configModel={history.model?.name ?? null}
              configVae={history.vae}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
