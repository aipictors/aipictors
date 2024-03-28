"use client"

import { GenerationImageDownloadButton } from "@/app/[lang]/generation/_components/task-view/generation-image-download-button"
import { GenerationImagePostButton } from "@/app/[lang]/generation/_components/task-view/generation-image-upload-button"
import { GenerationTaskActionDropdownMenu } from "@/app/[lang]/generation/_components/task-view/generation-task-action-dropdown-menu"
import { GenerationTaskCountSelect } from "@/app/[lang]/generation/_components/task-view/generation-task-count-select"
import { GenerationTaskDeleteButton } from "@/app/[lang]/generation/_components/task-view/generation-task-delete-button"
import { GenerationTaskPreviewModeButton } from "@/app/[lang]/generation/_components/task-view/generation-task-preview-mode-button"
import { GenerationTaskProtectedSelect } from "@/app/[lang]/generation/_components/task-view/generation-task-protected-select"
import { GenerationTaskRatingSelect } from "@/app/[lang]/generation/_components/task-view/generation-task-rating-select"
import { GenerationWorkActionDropdownMenu } from "@/app/[lang]/generation/_components/task-view/generation-work-action-dropdown-menu"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { TaskListThumbnailType } from "@/app/[lang]/generation/_types/task-list-thumbnail-type"
import { Toggle } from "@/components/ui/toggle"
import { config } from "@/config"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { useMutation } from "@apollo/client"
import { MaximizeIcon, MinimizeIcon } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  thumbnailSize: number
  setThumbnailSize(size: number): void
  onTogglePreviewMode(): void
}

/**
 * 履歴の操作
 * @param props
 * @returns
 */
export const GenerationTaskListActions = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex items-center px-2 pb-2 md:px-4 xl:px-4">
        {isDesktop && state !== "HISTORY_LIST_FULL" && (
          <GenerationTaskPreviewModeButton
            onTogglePreviewMode={props.onTogglePreviewMode}
          />
        )}
        <GenerationWorkActionDropdownMenu
          onChange={props.setThumbnailSize}
          thumbnailSize={props.thumbnailSize}
        />
      </div>
    </>
  )
}
