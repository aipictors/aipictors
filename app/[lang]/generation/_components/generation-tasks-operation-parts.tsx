"use client"

import GenerationHistoryDownloadWithZip from "@/app/[lang]/generation/_components/generation-history-download-with-zip"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Toggle } from "@/components/ui/toggle"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { cn } from "@/lib/utils"
import { useMutation } from "@apollo/client"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { MoreHorizontalIcon, StarIcon, Trash2Icon } from "lucide-react"

type Props = {
  rating: number
  thumbnailSize: string
  selectedTaskIds: string[]
  hidedTaskIds: string[]
  editMode: string
  showDateInput?: boolean
  dateText?: string
  onChangeRating(rating: number): void
  onChangeDateText(dateText: string): void
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
              <GenerationHistoryDownloadWithZip
                disabled={props.selectedTaskIds.length === 0}
                selectedTaskIds={props.selectedTaskIds}
              />
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

          {/* 日付指定 */}
          {props.showDateInput ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] pl-3 text-left font-normal",
                    !props && "text-muted-foreground",
                  )}
                >
                  {props.dateText ? (
                    format(props.dateText, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    props.dateText ? new Date(props.dateText) : undefined
                  }
                  onSelect={(date: Date | undefined) =>
                    props.onChangeDateText(
                      date ? format(date, "yyyy-MM-dd") : "",
                    )
                  }
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : null}
        </div>
      </div>
    </>
  )
}
