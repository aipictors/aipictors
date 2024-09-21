import { Button } from "~/components/ui/button"
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
} from "~/components/ui/dropdown-menu"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  thumbnailType: TaskListThumbnailType
  taskContentPositionType: TaskContentPositionType
  onChangeTaskContentPositionType(type: TaskContentPositionType): void
  onChangeThumbnailType(type: TaskListThumbnailType): void
  onSelectAll(): void
  onCancelAll(): void
}

/**
 * その他ボタン
 */
export function GenerationTaskActionDropdownMenu(props: Props) {
  const context = useGenerationContext()
  const t = useTranslation()

  /**
   * 予約生成が可能かどうか
   * @returns
   */
  const isEnabledReservedGeneration = () => {
    return (
      context.currentPass?.type === "STANDARD" ||
      context.currentPass?.type === "PREMIUM" ||
      context.currentPass?.type === "TWO_DAYS"
    )
  }

  const [deleteReservedTasks, { loading: isDeletingReservedTasks }] =
    useMutation(deleteReservedImageGenerationTasksMutation, {
      refetchQueries: [viewerCurrentPassQuery],
      awaitRefetchQueries: true,
    })

  /**
   * 予約タスクを一括削除する
   */
  const onDeleteReservedTasks = async () => {
    try {
      await deleteReservedTasks()
      toast(t("予約タスクを削除しました", "Reserved tasks deleted"))
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          title={t("サムネイルサイズ変更など", "Change thumbnail size, etc.")}
        >
          <MoreHorizontalIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {t("サムネイル画質", "Thumbnail Quality")}
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>
                {t("画質変更", "Change Quality")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={props.thumbnailType === "light"}
                onCheckedChange={props.onChangeThumbnailType.bind(
                  null,
                  "light",
                )}
              >
                {t("低画質", "Low Quality")}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={props.thumbnailType === "original"}
                onCheckedChange={props.onChangeThumbnailType.bind(
                  null,
                  "original",
                )}
              >
                {t("高画質", "High Quality")}
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <div className="hidden md:block">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t("履歴詳細の表示場所", "History Detail Position")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>
                  {t("場所変更", "Change Position")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={props.taskContentPositionType === "left"}
                  onCheckedChange={props.onChangeTaskContentPositionType.bind(
                    null,
                    "left",
                  )}
                >
                  {t("左", "Left")}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={props.taskContentPositionType === "right"}
                  onCheckedChange={props.onChangeTaskContentPositionType.bind(
                    null,
                    "right",
                  )}
                >
                  {t("右", "Right")}
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </div>
        {isEnabledReservedGeneration() && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {t("一括操作", "Bulk Actions")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>{t("項目", "Items")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Button
                  onClick={props.onSelectAll}
                  variant={"ghost"}
                  className="w-full text-left"
                >
                  {t("一括選択", "Select All")}
                </Button>
                <Button
                  onClick={props.onCancelAll}
                  variant={"ghost"}
                  className="w-full text-left"
                >
                  {t("一括解除", "Deselect All")}
                </Button>
                {!isDeletingReservedTasks ? (
                  <Button
                    onClick={onDeleteReservedTasks}
                    variant={"ghost"}
                    className="w-full"
                  >
                    {t("予約一括削除", "Delete All Reserved")}
                  </Button>
                ) : (
                  <Loader2 className="w-4 animate-spin" />
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
      }
    }
  }`,
)

const deleteReservedImageGenerationTasksMutation = graphql(
  `mutation DeleteReservedImageGenerationTasks {
    deleteReservedImageGenerationTasks {
      id
      prompt
      negativePrompt
      seed
      steps
      scale
      sampler
      clipSkip
      sizeType
      t2tImageUrl
      t2tMaskImageUrl
      t2tDenoisingStrengthSize
      t2tInpaintingFillSize
      createdAt
      isDeleted
      generationType
      model {
        id
        name
        type
      }
      vae
      token
      nanoid
      upscaleSize
    }
  }`,
)
