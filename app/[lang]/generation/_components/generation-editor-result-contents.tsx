"use client"

import { GenerationTaskView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-view"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackResultCard } from "@/app/[lang]/generation/tasks/_components/fallback-result-card"
import { GenerationResultCard } from "@/app/[lang]/generation/tasks/_components/generation-result-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { config } from "@/config"
import { ImageGenerationTaskNode } from "@/graphql/__generated__/graphql"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useSuspenseQuery } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import Link from "next/link"
import { Suspense } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  sizeType?: string
  additionalTask: ImageGenerationTaskNode | null
  rating: number
  editMode: string
  selectedTaskIds: string[]
  thumbnailSize: string
  hidedTaskIds: string[]
  pcViewType?: string
  setSelectedTaskIds: (selectedTaskIds: string[]) => void
  onChangeSampler(sampler: string): void
  onChangeScale(scale: number): void
  onChangeSeed(seed: number): void
  onChangeVae(vae: string | null): void
  onChangePromptText(prompt: string): void
  onChangeNegativePromptText(prompt: string): void
}

export const GenerationEditorResultContents = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const { data } = useSuspenseQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: props.rating !== -1 ? { rating: props.rating } : {},
    },
    errorPolicy: "all",
    context: { simulateError: true },
  })

  // 非表示指定のタスクを除外
  const filteredImageGenerationTasks = (
    data?.viewer?.imageGenerationTasks || []
  ).filter((task) => task.nanoid && !props.hidedTaskIds.includes(task.nanoid))

  // 追加表示したいタスクがあれば追加して最終的なタスクのリストを生成
  const newImageGenerationTasks = [
    ...filteredImageGenerationTasks,
    props.additionalTask,
  ].filter(
    (task) => task !== null && task !== undefined,
  ) as ImageGenerationTaskNode[]

  const onRestore = (taskId: string) => {
    const task = data?.viewer?.imageGenerationTasks.find(
      (task) => task.nanoid === taskId,
    )
    if (typeof task === "undefined") return
    props.onChangeSampler(task.sampler)
    props.onChangeScale(task.scale)
    props.onChangeSeed(task.seed)
    props.onChangeVae(task.vae)
    props.onChangePromptText(task.prompt)
    props.onChangeNegativePromptText(task.negativePrompt)
    toast("設定を復元しました")
  }

  const activeTasks = newImageGenerationTasks.filter((task) => {
    if (!task || task.isDeleted) return false
    return task.status === "IN_PROGRESS" || task.status === "DONE"
  }) as ImageGenerationTaskNode[]

  const onSelectTask = (taskId: string | null, status: string) => {
    if (status !== "DONE") {
      toast("選択できない履歴です")
      return
    }
    if (!taskId) {
      toast("存在しない履歴です")
      return
    }
    const isAlreadySelected = props.selectedTaskIds.includes(taskId)

    if (isAlreadySelected) {
      props.setSelectedTaskIds(
        props.selectedTaskIds.filter((id) => id !== taskId),
      )
    } else {
      props.setSelectedTaskIds([...props.selectedTaskIds, taskId])
    }
  }

  const getGridClasses = (size: string): string => {
    if (props.sizeType === "full") {
      switch (size) {
        case "small":
          return "p-2 grid grid-cols-3 gap-2 p-4 sm:pl-4 md:grid-cols-7 2xl:grid-cols-12 lg:grid-cols-10 xl:grid-cols-11"
        case "middle":
          return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-6 2xl:grid-cols-10 lg:grid-cols-8 xl:grid-cols-9"
        case "big":
          return "p-2 grid grid-cols-1 gap-2 p-4 sm:pl-4 md:grid-cols-4 2xl:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6"
        default:
          return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-2 2xl:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6"
      }
    }
    switch (size) {
      case "small":
        return "p-2 grid grid-cols-3 gap-2 p-4 sm:pl-4 md:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-4 xl:grid-cols-3"
      case "middle":
        return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
      case "big":
        return "p-2 grid grid-cols-1 gap-2 p-4 sm:pl-4 md:grid-cols-1 2xl:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1"
      default:
        return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
    }
  }

  return (
    <>
      <ScrollArea>
        <div className={getGridClasses(props.thumbnailSize)}>
          {activeTasks?.map((task) => (
            <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
              <Suspense fallback={<FallbackResultCard />}>
                {props.editMode === "edit" ? (
                  <Button
                    onClick={() => onSelectTask(task.nanoid, task.status)}
                    className={
                      "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                    }
                  >
                    <GenerationResultCard
                      taskId={task.id}
                      token={task.token}
                      isSelected={props.selectedTaskIds.includes(
                        task.nanoid ?? "",
                      )}
                    />
                  </Button>
                ) : null}
                {props.editMode !== "edit" &&
                  (!isDesktop ? (
                    <Link href={`/generation/tasks/${task.nanoid}`}>
                      <Button
                        className={
                          "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                        }
                      >
                        <GenerationResultCard
                          taskId={task.id}
                          token={task.token}
                        />
                      </Button>
                    </Link>
                  ) : props.pcViewType === "dialog" ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className={
                            "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                          }
                        >
                          <GenerationResultCard
                            taskId={task.id}
                            token={task.token}
                          />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-0 flex flex-col gap-0">
                        <Suspense fallback={<FallbackResultCard />}>
                          <GenerationTaskView
                            isScroll={true}
                            taskId={task.nanoid ?? ""}
                            onRestore={onRestore}
                          />
                        </Suspense>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          className={
                            "bg-gray-300 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-800 hover:opacity-80 border-solid border-2 border-gray p-0 h-auto overflow-hidden rounded relative"
                          }
                        >
                          <GenerationResultCard
                            taskId={task.id}
                            token={task.token}
                          />
                        </Button>
                      </SheetTrigger>
                      <SheetContent
                        side={"right"}
                        className="p-0 flex flex-col gap-0"
                      >
                        <Suspense fallback={<FallbackResultCard />}>
                          <GenerationTaskView
                            taskId={task.nanoid ?? ""}
                            onRestore={onRestore}
                          />
                        </Suspense>
                      </SheetContent>
                    </Sheet>
                  ))}
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>
      </ScrollArea>
    </>
  )
}
