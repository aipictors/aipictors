"use client"

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
import { Toggle } from "@/components/ui/toggle"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { useMutation } from "@apollo/client"
import {
  ArrowDownToLineIcon,
  MoreHorizontalIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"

type Props = {
  rating: number
  thumbnailSize: string
  selectedTaskIds: string[]
  hidedTaskIds: string[]
  editMode: string
  onChangeRating(rating: number): void
  setThumbnailSize(size: string): void
  setSelectedTaskIds(selectedTaskIds: string[]): void
  setHidedTaskIds(selectedTaskIds: string[]): void
  setEditMode(editMode: string): void
}

export const GenerationTasksOperationParts = (props: Props) => {
  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)

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
              id: taskId, // props.taskId ではなく、ループ内の taskId を使用
            },
          },
        }),
      )
      await Promise.all(promises)
      props.setHidedTaskIds(props.selectedTaskIds)
      props.setSelectedTaskIds([])
    } catch (error) {
      console.error("Error in task deletion:", error)
    }
  }

  const changeThumbnailSize = (size: string) => () => {
    props.setThumbnailSize(size)
  }

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex px-4 pb-2 items-center">
        <div className="flex space-x-2 items-center w-full">
          {/* 履歴選択・キャンセルボタン */}
          <Toggle
            className="w-48"
            onClick={onChangeEditMode}
            variant="outline"
            size={"sm"}
          >
            {props.editMode === "edit" ? "キャンセル" : "選択"}
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
              <Button
                disabled={props.selectedTaskIds.length === 0}
                variant={"ghost"}
                size={"icon"}
              >
                <ArrowDownToLineIcon className="w-4" />
              </Button>
            </>
          ) : null}
          {/* お気に入り、その他ボタン */}
          {props.editMode !== "edit" ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"} size={"icon"}>
                    <StarIcon className="w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{"お気に入り"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={props.rating === -1}
                    onCheckedChange={() => {
                      props.onChangeRating(-1)
                    }}
                  >
                    {"all"}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={props.rating === 0}
                    onCheckedChange={() => {
                      props.onChangeRating(0)
                    }}
                  >
                    {"0"}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={props.rating === 1}
                    onCheckedChange={() => {
                      props.onChangeRating(1)
                    }}
                  >
                    {"1"}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={props.rating === 2}
                    onCheckedChange={() => {
                      props.onChangeRating(2)
                    }}
                  >
                    {"2"}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={props.rating === 3}
                    onCheckedChange={() => {
                      props.onChangeRating(3)
                    }}
                  >
                    {"3"}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={props.rating === 4}
                    onCheckedChange={() => {
                      props.onChangeRating(4)
                    }}
                  >
                    {"4"}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={props.rating === 5}
                    onCheckedChange={() => {
                      props.onChangeRating(5)
                    }}
                  >
                    {"5"}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
        </div>
      </div>
    </>
  )
}
