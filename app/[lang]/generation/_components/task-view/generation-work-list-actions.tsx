"use client"

import { GenerationTaskPreviewModeButton } from "@/app/[lang]/generation/_components/task-view/generation-task-preview-mode-button"
import { GenerationWorkActionDropdownMenu } from "@/app/[lang]/generation/_components/task-view/generation-work-action-dropdown-menu"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { Input } from "@/components/ui/input"
import { Toggle } from "@/components/ui/toggle"
import { config } from "@/config"
import type { WorkOrderBy } from "@/graphql/__generated__/graphql"
import { MaximizeIcon, MinimizeIcon } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  thumbnailSize: number
  sortType: WorkOrderBy
  showHistoryExpandButton: boolean
  setThumbnailSize(size: number): void
  onTogglePreviewMode(): void
  onChangeSortType(sortType: WorkOrderBy): void
  onChangeWord(word: string): void
}

/**
 * 作品一覧の操作
 * @param props
 * @returns
 */
export const GenerationWorkListActions = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const { send } = GenerationConfigContext.useActorRef()

  const openFullTask = () => {
    send({ type: "OPEN_FULL_WORK_LIST" })
  }

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex items-center gap-x-2 px-2 pb-2 md:px-4 xl:px-4">
        <Input
          minLength={1}
          maxLength={120}
          required
          type="text"
          name="title"
          placeholder="検索ワード"
          className="flex items-center gap-x-4 px-4 pb-2 md:px-4 xl:px-4"
          onChange={(event) => {
            props.onChangeWord(event.target.value)
          }}
        />
        {isDesktop && state !== "WORK_LIST_FULL" && (
          <GenerationTaskPreviewModeButton
            onTogglePreviewMode={props.onTogglePreviewMode}
          />
        )}
        <GenerationWorkActionDropdownMenu
          sortType={props.sortType}
          thumbnailSize={props.thumbnailSize}
          onChangeSortType={props.onChangeSortType}
          onChange={props.setThumbnailSize}
        />
        {/* 全画面表示 */}
        {isDesktop && props.showHistoryExpandButton && (
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
        )}
      </div>
    </>
  )
}
