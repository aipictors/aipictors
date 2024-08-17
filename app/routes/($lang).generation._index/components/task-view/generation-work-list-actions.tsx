import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Toggle } from "~/components/ui/toggle"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { GenerationTaskPreviewModeButton } from "~/routes/($lang).generation._index/components/task-view/generation-task-preview-mode-button"
import { GenerationWorkActionDropdownMenu } from "~/routes/($lang).generation._index/components/task-view/generation-work-action-dropdown-menu"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { MaximizeIcon, MinimizeIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "~/components/ui/input"

type Props = {
  thumbnailSize: number
  sortType: IntrospectionEnum<"WorkOrderBy">
  showHistoryExpandButton: boolean
  setThumbnailSize(size: number): void
  onTogglePreviewMode(): void
  onChangeSortType(sortType: IntrospectionEnum<"WorkOrderBy">): void
  onChangeWord(word: string): void
}

/**
 * 作品一覧の操作
 */
export function GenerationWorkListActions(props: Props) {
  const context = useGenerationContext()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const { send } = GenerationConfigContext.useActorRef()

  const [previewWord, setPreviewWord] = useState("")

  const openFullTask = () => {
    send({ type: "OPEN_FULL_WORK_LIST" })
  }

  const onCancelModelSearch = () => {
    context.updateSearchWorksModelIdAndName(null, null)
  }

  return (
    <>
      {/* 作品一覧（検索）の操作一覧 */}
      <div className="px-2 pb-2 md:px-4 xl:px-4">
        <div className="flex items-center gap-x-2">
          <Input
            minLength={1}
            maxLength={120}
            required
            type="text"
            name="title"
            placeholder="検索ワード"
            className="flex items-center gap-x-4 px-4 pb-2 md:px-4 xl:px-4"
            onChange={(event) => {
              setPreviewWord(event.target.value)
            }}
          />
          <Button
            onClick={() => {
              props.onChangeWord(previewWord)
            }}
            variant={"secondary"}
          >
            検索
          </Button>
          {state !== "WORK_LIST_FULL" && (
            <div className="hidden md:block">
              <GenerationTaskPreviewModeButton
                onTogglePreviewMode={props.onTogglePreviewMode}
              />
            </div>
          )}
          <GenerationWorkActionDropdownMenu
            sortType={props.sortType}
            thumbnailSize={props.thumbnailSize}
            onChangeSortType={props.onChangeSortType}
            onChange={props.setThumbnailSize}
          />
          {/* 全画面表示 */}
          {props.showHistoryExpandButton && (
            <div className="hidden md:block">
              <Toggle
                onClick={openFullTask}
                variant={"outline"}
                title="作品一覧の全画面モード切替"
              >
                {state === "WORK_LIST_FULL" ? (
                  <MinimizeIcon className="w-4" />
                ) : (
                  <MaximizeIcon className="w-4" />
                )}
              </Toggle>
            </div>
          )}
        </div>
        <div className="mt-2" />
        {context.config.searchModelName && (
          <Badge variant="secondary">
            {context.config.searchModelName}モデル
            <Button
              variant={"destructive"}
              size={"icon"}
              onClick={onCancelModelSearch}
              className="ml-2 h-3 w-3"
            >
              <XIcon className="w-4" />
            </Button>
          </Badge>
        )}
      </div>
    </>
  )
}
