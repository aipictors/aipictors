"use client"

import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationResultBody } from "@/app/[lang]/(beta)/generation/_components/generation-result-body"
import { GenerationTaskView } from "@/app/[lang]/(beta)/generation/results/[result]/_components/generation-task-view"
import { ErrorResultCard } from "@/app/[lang]/(beta)/generation/results/_components/error-result-card"
import { FallbackResultCard } from "@/app/[lang]/(beta)/generation/results/_components/fallback-result-card"
import { GenerationResultCard } from "@/app/[lang]/(beta)/generation/results/_components/generation-result-card"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toggle } from "@/components/ui/toggle"
import { config } from "@/config"
import { ViewerImageGenerationTasksQuery } from "@/graphql/__generated__/graphql"
import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { useMutation } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import { ArrowDownToLineIcon, StarIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Suspense, useState } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"
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
  const [editMode, setEditMode] = useState("")
  const [mutation] = useMutation(updateRatingImageGenerationTaskMutation)

  const onRestore = (taskId: string) => {
    const task = props.tasks.find((task) => task.id === taskId)
    if (typeof task === "undefined") return
    props.onChangeSampler(task.sampler)
    props.onChangeScale(task.scale)
    props.onChangeSeed(task.seed)
    props.onChangeSize(task.sizeType)
    props.onChangeVae(task.vae)
    props.onChangePromptText(task.prompt)
    props.onChangeNegativePromptText(task.negativePrompt)
    toast("設定を復元しました")
  }

  const onChangeRating = async (taskId: string, value: number) => {
    try {
      await mutation({
        variables: {
          input: {
            id: taskId,
            rating: value,
          },
        },
      })
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  const onChangeEditMode = () => {
    setEditMode((prev) => (prev === "" ? "edit" : ""))
  }

  const activeTasks = props.tasks?.filter((task) => {
    if (task.isDeleted) return false
    return task.status === "IN_PROGRESS" || task.status === "DONE"
  })

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

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
        {config.isDevelopmentMode && (
          <div className="flex px-2 pb-2 space-x-2">
            <Toggle onChange={onChangeEditMode} variant="outline">
              選択
            </Toggle>
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
          <div className="p-2 grid grid-cols-2 gap-2 py-2 pl-2 pr-2 sm:pl-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {activeTasks.map((task) => (
              <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
                <Suspense fallback={<FallbackResultCard />}>
                  {!isDesktop ? (
                    <Link href={`/generation/results/${task.nanoid}`}>
                      <Button className="p-0 h-auto overflow-hidden border-1 rounded outline-none">
                        <GenerationResultCard
                          taskId={task.id}
                          token={task.token}
                        />
                      </Button>
                    </Link>
                  ) : (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button className="p-0 h-auto overflow-hidden border-1 rounded outline-none">
                          <GenerationResultCard
                            taskId={task.id}
                            token={task.token}
                          />
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side={"left"}
                        className="p-0 flex flex-col gap-0"
                      >
                        <Suspense fallback={<FallbackResultCard />}>
                          <GenerationTaskView taskId={task.nanoid ?? ""} />
                        </Suspense>
                      </SheetContent>
                    </Sheet>
                  )}
                </Suspense>
              </ErrorBoundary>
            ))}
          </div>
        </ScrollArea>
      </GenerationEditorCard>
    </>
  )
}
