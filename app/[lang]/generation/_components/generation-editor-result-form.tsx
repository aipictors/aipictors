"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import GenerationHistoryDownloadWithZip from "@/app/[lang]/generation/_components/generation-history-download-with-zip"
import DownloadButton from "@/app/[lang]/generation/_components/generation-history-download-with-zip"
import { AppConfirmDialog } from "@/components/app/app-confirm-dialog"
import { AppLoading } from "@/components/app/app-loading"
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
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { useMutation } from "@apollo/client"
import { MoreHorizontalIcon, StarIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { Suspense, useState } from "react"

type Props = {
  userNanoid: string | null
  rating: number
  onChangeRating(rating: number): void
  onChangeSampler(sampler: string): void
  onChangeScale(scale: number): void
  onChangeSeed(seed: number): void
  onChangeSize(size: string): void
  onChangeVae(vae: string | null): void
  onChangePromptText(prompt: string): void
  onChangeNegativePromptText(prompt: string): void
}

export const GenerationEditorResultForm = (props: Props) => {
  const [editMode, setEditMode] = useState("")
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")
  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)

  const onChangeEditMode = () => {
    if (editMode === "edit") {
      setSelectedTaskIds([])
    }
    setEditMode((prev) => (prev === "" ? "edit" : ""))
  }

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

  const changeThumbnailSize = (size: string) => () => {
    setThumbnailSize(size)
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
              {/* 一括ダウンロードボタン */}
              <GenerationHistoryDownloadWithZip
                disabled={selectedTaskIds.length === 0}
                selectedTaskIds={selectedTaskIds}
              />
            </>
          ) : null}
          {/* お気に入り、その他ボタン */}
          {editMode !== "edit" ? (
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
          <div className="invisible w-full" />
          {/* 履歴一覧リンク */}
          <Link href={"/generation/tasks"}>
            <Button
              className="w-16 sm:w-24 ml-auto"
              variant={"secondary"}
              size={"sm"}
            >
              {"全て"}
            </Button>
          </Link>
        </div>
      </div>
      <Separator />
      {/* 履歴一覧 */}
      <Suspense fallback={<AppLoading />}>
        <GenerationEditorResultContents
          rating={props.rating}
          editMode={editMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          setSelectedTaskIds={setSelectedTaskIds}
          onChangeSampler={props.onChangeSampler}
          onChangeScale={props.onChangeScale}
          onChangeSeed={props.onChangeSeed}
          onChangeVae={props.onChangeVae}
          onChangePromptText={props.onChangePromptText}
          onChangeNegativePromptText={props.onChangeNegativePromptText}
        />
      </Suspense>
    </>
  )
}
