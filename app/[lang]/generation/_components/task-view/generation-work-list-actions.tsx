"use client"

import { GenerationTaskPreviewModeButton } from "@/app/[lang]/generation/_components/task-view/generation-task-preview-mode-button"
import { GenerationWorkActionDropdownMenu } from "@/app/[lang]/generation/_components/task-view/generation-work-action-dropdown-menu"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { config } from "@/config"
import type { WorkOrderBy } from "@/graphql/__generated__/graphql"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  thumbnailSize: number
  sortType: WorkOrderBy
  setThumbnailSize(size: number): void
  onTogglePreviewMode(): void
  onChangeSortType(sortType: WorkOrderBy): void
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

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex items-center gap-x-2 px-2 pb-2 md:px-4 xl:px-4">
        {isDesktop && state !== "HISTORY_LIST_FULL" && (
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
      </div>
    </>
  )
}
