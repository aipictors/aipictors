"use client"

import { GenerationEditorCard } from "@/app/[lang]/(beta)/generation/_components/generation-editor-card"
import { GenerationTaskView } from "@/app/[lang]/(beta)/generation/tasks/[task]/_components/generation-task-view"
import { ErrorResultCard } from "@/app/[lang]/(beta)/generation/tasks/_components/error-result-card"
import { FallbackResultCard } from "@/app/[lang]/(beta)/generation/tasks/_components/fallback-result-card"
import { GenerationResultCard } from "@/app/[lang]/(beta)/generation/tasks/_components/generation-result-card"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Toggle } from "@/components/ui/toggle"
import { config } from "@/config"
import { ViewerImageGenerationTasksQuery } from "@/graphql/__generated__/graphql"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { updateRatingImageGenerationTaskMutation } from "@/graphql/mutations/update-rating-image-generation-task"
import { useMutation } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import {
  ArrowDownToLineIcon,
  Check,
  MoreHorizontalIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
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
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [isOpenTool, setIsOpenTool] = useState<boolean>(false)
  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")
  const [mutation] = useMutation(updateRatingImageGenerationTaskMutation)

  const onRestore = (taskId: string) => {
    const task = props.tasks.find((task) => task.nanoid === taskId)
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

  const onChangeEditMode = () => {
    if (editMode === "edit") {
      setSelectedTaskIds([])
    }
    setEditMode((prev) => (prev === "" ? "edit" : ""))
    console.log(editMode)
  }

  const activeTasks = props.tasks?.filter((task) => {
    if (task.isDeleted) return false
    return task.status === "IN_PROGRESS" || task.status === "DONE"
  })

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const onSelectTask = (taskId: string | null, status: string) => {
    if (status !== "DONE") {
      toast("選択できない履歴です")
      return
    }
    if (!taskId) {
      toast("存在しない履歴です")
      return
    }
    const isAlreadySelected = selectedTaskIds.includes(taskId)

    if (isAlreadySelected) {
      setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId))
    } else {
      setSelectedTaskIds([...selectedTaskIds, taskId])
    }
  }

  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)

  const onTrashTasks = async () => {
    try {
      const promises = selectedTaskIds.map((taskId) =>
        deleteTask({
          variables: {
            input: {
              id: taskId, // props.taskId ではなく、ループ内の taskId を使用
            },
          },
        }),
      )
      await Promise.all(promises)
      setSelectedTaskIds([])
    } catch (error) {
      console.error("Error in task deletion:", error)
    }
  }

  const onToggleTool = () => {
    setIsOpenTool((prev) => !prev)
  }

  const changeThumbnailSize = (size: string) => () => {
    setThumbnailSize(size)
  }

  const getGridClasses = (size: string): string => {
    switch (size) {
      case "small":
        return "p-2 grid grid-cols-2 gap-2 py-2 pl-2 pr-2 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
      case "middle":
        return "p-2 grid grid-cols-2 gap-2 py-2 pl-2 pr-2 sm:pl-4 md:grid-cols-2 2xl:grid-cols-3 lg:grid-cols-2 xl:grid-cols-1"
      case "big":
        return "p-2 grid grid-cols-2 gap-2 py-2 pl-2 pr-2 sm:pl-4 md:grid-cols-2 2xl:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1"
      default:
        return "p-2 grid grid-cols-2 gap-2 py-2 pl-2 pr-2 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
    }
  }

  const selectedTaskClass = (taskId: string): string => {
    return selectedTaskIds.includes(taskId) ? "opacity-50" : ""
  }

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
        {/* 操作一覧 */}
        <div className="flex items-center">
          <div className="flex px-2 pb-2 space-x-2 items-center">
            {/* 履歴選択・キャンセルボタン */}
            <Toggle onClick={onChangeEditMode} variant="outline">
              {editMode === "edit" ? "キャンセル" : "選択"}
            </Toggle>
            {/* 履歴削除ボタン、画像ダウンロードボタン */}
            {editMode === "edit" ? (
              <>
                <AppConfirmDialog
                  title={"確認"}
                  description={"本当に削除しますか？"}
                  onNext={() => {
                    onTrashTasks()
                  }}
                  onCancel={() => {}}
                >
                  <Button
                    disabled={selectedTaskIds.length === 0}
                    variant={"ghost"}
                    size={"icon"}
                  >
                    <Trash2Icon className="w-4" />
                  </Button>
                </AppConfirmDialog>
                <Button
                  disabled={selectedTaskIds.length === 0}
                  variant={"ghost"}
                  size={"icon"}
                >
                  <ArrowDownToLineIcon className="w-4" />
                </Button>
              </>
            ) : null}
            {/* お気に入り、その他ボタン */}
            {editMode !== "edit" ? (
              <>
                <Button disabled variant={"ghost"} size={"icon"}>
                  <StarIcon className="w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <MoreHorizontalIcon className="w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        {"サイズ"}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuLabel>{"サイズ変更"}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={thumbnailSize === "small"}
                            onCheckedChange={changeThumbnailSize("small")}
                          >
                            小
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={thumbnailSize === "middle"}
                            onCheckedChange={changeThumbnailSize("middle")}
                          >
                            中
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={thumbnailSize === "big"}
                            onCheckedChange={changeThumbnailSize("big")}
                          >
                            大
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>
          {/* 履歴一覧リンク */}
          <Link href="/generation/tasks" className="ml-auto">
            <Button className="w-24" variant={"secondary"} size={"sm"}>
              {"全て"}
            </Button>
          </Link>
        </div>{" "}
        <Separator />
        {/* 履歴一覧 */}
        <ScrollArea>
          <div className={getGridClasses(thumbnailSize)}>
            {activeTasks.map((task) => (
              <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
                <Suspense fallback={<FallbackResultCard />}>
                  {editMode === "edit" ? (
                    <Button
                      onClick={() => onSelectTask(task.nanoid, task.status)}
                      className={`p-0 h-auto overflow-hidden border-1 rounded outline-none relative ${selectedTaskClass(
                        task.nanoid ?? "",
                      )}`}
                    >
                      <GenerationResultCard
                        taskId={task.id}
                        token={task.token}
                      />
                      {selectedTaskIds.includes(task.nanoid ?? "") ? (
                        <div className="absolute bg-white rounded-full right-2 bottom-2">
                          <Check color="black" />
                        </div>
                      ) : null}
                    </Button>
                  ) : null}
                  {editMode !== "edit" &&
                    (!isDesktop ? (
                      <Link href={`/generation/tasks/${task.nanoid}`}>
                        <Button className="p-0 h-auto overflow-hidden border-1 rounded outline-none">
                          <GenerationResultCard
                            taskId={task.id}
                            token={task.token}
                            className={selectedTaskClass(task.nanoid ?? "")}
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
                              className={selectedTaskClass(task.nanoid ?? "")}
                            />
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side={"right"}
                          className="p-0 flex flex-col gap-0"
                        >
                          <Suspense fallback={<FallbackResultCard />}>
                            <GenerationTaskView
                              onRestore={onRestore}
                              taskId={task.nanoid ?? ""}
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
      </GenerationEditorCard>
    </>
  )
}
