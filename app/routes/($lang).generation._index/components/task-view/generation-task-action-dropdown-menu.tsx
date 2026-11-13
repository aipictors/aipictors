import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2, Settings2Icon } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  thumbnailType: TaskListThumbnailType
  onChangeThumbnailType(type: TaskListThumbnailType): void
  /** 以前はこのメニューに一括選択があった（今は「選択」の中にある） */
  onSelectAll?(): void
  onCancelAll?(): void
}

/**
 * 表示の設定（サムネイルの画質、予約の取り消し）
 */
export function GenerationTaskActionDropdownMenu (props: Props) {
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
          title={t("表示の設定", "Display settings")}
          aria-label={t("表示の設定", "Display settings")}
        >
          <Settings2Icon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {t("サムネイルの画質", "Thumbnail quality")}
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={props.thumbnailType === "light"}
          onCheckedChange={props.onChangeThumbnailType.bind(null, "light")}
        >
          {t("低画質（軽い）", "Low (faster)")}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={props.thumbnailType === "original"}
          onCheckedChange={props.onChangeThumbnailType.bind(null, "original")}
        >
          {t("高画質", "High")}
        </DropdownMenuCheckboxItem>
        {isEnabledReservedGeneration() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isDeletingReservedTasks}
              onSelect={() => void onDeleteReservedTasks()}
            >
              {isDeletingReservedTasks && (
                <Loader2 className="mr-2 w-4 animate-spin" />
              )}
              {t("予約をすべて取り消す", "Cancel all reserved")}
            </DropdownMenuItem>
          </>
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
      width
      height
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
