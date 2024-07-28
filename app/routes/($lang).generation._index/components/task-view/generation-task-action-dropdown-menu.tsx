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
import { imageReservedGenerationTaskFieldsFragment } from "~/graphql/fragments/image-generation-reserved-task-field"
import { passFieldsFragment } from "~/graphql/fragments/pass-fields"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Loader2, MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"
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
      toast("予約タスクを削除しました")
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
          title="サムネイルサイズ変更など"
        >
          <MoreHorizontalIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{"サムネイル画質"}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>{"画質変更"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={props.thumbnailType === "light"}
                onCheckedChange={props.onChangeThumbnailType.bind(
                  null,
                  "light",
                )}
              >
                低画質
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={props.thumbnailType === "original"}
                onCheckedChange={props.onChangeThumbnailType.bind(
                  null,
                  "original",
                )}
              >
                高画質
              </DropdownMenuCheckboxItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <div className="hidden md:block">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {"履歴詳細の表示場所"}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>{"場所変更"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={props.taskContentPositionType === "left"}
                  onCheckedChange={props.onChangeTaskContentPositionType.bind(
                    null,
                    "left",
                  )}
                >
                  左
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={props.taskContentPositionType === "right"}
                  onCheckedChange={props.onChangeTaskContentPositionType.bind(
                    null,
                    "right",
                  )}
                >
                  右
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </div>
        {isEnabledReservedGeneration() && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{"一括操作"}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>{"項目"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Button
                  onClick={props.onSelectAll}
                  variant={"ghost"}
                  className="w-full text-left"
                >
                  {"一括選択"}
                </Button>
                <Button
                  onClick={props.onCancelAll}
                  variant={"ghost"}
                  className="w-full text-left"
                >
                  {"一括解除"}
                </Button>
                {!isDeletingReservedTasks ? (
                  <Button
                    onClick={onDeleteReservedTasks}
                    variant={"ghost"}
                    className="w-full"
                  >
                    {"予約一括削除"}
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
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)

const deleteReservedImageGenerationTasksMutation = graphql(
  `mutation DeleteReservedImageGenerationTasks {
    deleteReservedImageGenerationTasks {
      ...ImageReservedGenerationTaskFields
    }
  }`,
  [imageReservedGenerationTaskFieldsFragment],
)
