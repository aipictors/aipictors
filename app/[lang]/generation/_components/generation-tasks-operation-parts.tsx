"use client"

import { GenerationImageDownloadButton } from "@/app/[lang]/generation/_components/generation-image-download-button"
import { GenerationImagePostButton } from "@/app/[lang]/generation/_components/generation-image-upload-button"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { useMutation } from "@apollo/client"
import { MoreHorizontalIcon, StarIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"

type Props = {
  rating: number
  thumbnailSize: string
  selectedTaskIds: string[]
  hidedTaskIds: string[]
  editMode: string
  showCountInput?: boolean
  showHistoryAllButton?: boolean
  viewCount?: number
  onChangeRating(rating: number): void
  onChangeViewCount(count: number): void
  setThumbnailSize(size: string): void
  setSelectedTaskIds(selectedTaskIds: string[]): void
  setHidedTaskIds(selectedTaskIds: string[]): void
  setEditMode(editMode: string): void
}

export const GenerationTasksOperationParts = (props: Props) => {
  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)
  const router = useRouter()

  const onChangeEditMode = () => {
    if (props.editMode === "edit") {
      props.setSelectedTaskIds([])
    }
    props.setEditMode(props.editMode === "" ? "edit" : "")
  }

  const onTrashTasks = async () => {
    try {
      const promises = props.selectedTaskIds.map((taskId) =>
        deleteTask({
          variables: {
            input: {
              nanoid: taskId, // props.taskId ではなく、ループ内の taskId を使用
            },
          },
        }),
      )
      await Promise.all(promises)
      props.setHidedTaskIds([...props.hidedTaskIds, ...props.selectedTaskIds])
      props.setSelectedTaskIds([])
    } catch (error) {
      console.error("Error in task deletion:", error)
    }
  }

  const changeThumbnailSize = (size: string) => () => {
    props.setThumbnailSize(size)
  }

  const moveHistoryPage = () => {
    router.push("/generation/tasks")
  }

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex px-4 pb-2 items-center">
        <div className="flex space-x-2 items-center w-full">
          {/* 履歴選択・キャンセルボタン */}
          <Toggle
            className="w-16"
            onClick={onChangeEditMode}
            variant="outline"
            size={"sm"}
          >
            {props.editMode === "edit" ? "解除" : "選択"}
          </Toggle>
          {/* 履歴削除ボタン、画像ダウンロードボタン */}
          {props.editMode === "edit" ? (
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
                  disabled={props.selectedTaskIds.length === 0}
                  variant={"ghost"}
                  size={"icon"}
                >
                  <Trash2Icon className="w-4" />
                </Button>
              </AppConfirmDialog>
              <GenerationImageDownloadButton
                disabled={props.selectedTaskIds.length === 0}
                selectedTaskIds={props.selectedTaskIds}
              />
              <GenerationImagePostButton
                disabled={props.selectedTaskIds.length === 0}
                selectedTaskIds={props.selectedTaskIds}
              />
            </>
          ) : null}
          {/* お気に入り、その他ボタン */}
          {props.editMode !== "edit" ? (
            <>
              <Select
                onValueChange={(value: string) =>
                  props.onChangeRating(Number(value))
                }
              >
                <SelectTrigger className="h-9 w-32">
                  <StarIcon className="w-4" />
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="-1">すべて</SelectItem>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"}>
                    <MoreHorizontalIcon className="w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>{"サイズ"}</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuLabel>{"サイズ変更"}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={props.thumbnailSize === "small"}
                          onCheckedChange={changeThumbnailSize("small")}
                        >
                          小
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={props.thumbnailSize === "middle"}
                          onCheckedChange={changeThumbnailSize("middle")}
                        >
                          中
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={props.thumbnailSize === "big"}
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

          {/* 枚数指定 */}
          {props.showCountInput && props.viewCount ? (
            <Select
              value={props.viewCount.toString()}
              onValueChange={(value: string) => {
                props.onChangeViewCount(value === "" ? 50 : parseInt(value, 10))
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue placeholder="枚数" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{"枚数選択"}</SelectLabel>
                  <SelectItem value="50">{"50"}</SelectItem>
                  <SelectItem value="100">{"100"}</SelectItem>
                  <SelectItem value="200">{"200"}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : null}
        </div>
        {/* 履歴一覧リンク */}
        {props.showHistoryAllButton && props.editMode !== "edit" ? (
          <Button
            onClick={moveHistoryPage}
            className="w-16 sm:w-24 ml-auto"
            variant={"secondary"}
            size={"sm"}
          >
            {"すべて"}
          </Button>
        ) : null}
      </div>
    </>
  )
}
