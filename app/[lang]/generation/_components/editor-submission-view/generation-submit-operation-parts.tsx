"use client"

import { GenerationCountSelect } from "@/app/[lang]/generation/_components/editor-submission-view/generation-count-select"
import { GenerationReserveCountInput } from "@/app/[lang]/generation/_components/editor-submission-view/generation-reserve-count-input"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/editor-submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/generation-terms-button"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTasksCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-tasks-cancel-button"

type Props = {
  generationMode: string
  isCreatingTask: boolean
  inProgressImageGenerationTasksCount: number
  inProgressImageGenerationReservedTasksCount: number
  isDeletingReservedTasks: boolean
  maxTasksCount: number
  tasksCount: number
  termsText: string
  availableImageGenerationMaxTasksCount: number
  generationCount: number
  reservedGenerationCount: number
  setGenerationCount: (count: number) => void
  onCreateReservedTask: () => void
  onCreateTask: () => void
  onSignTerms: () => void
  onDeleteReservedTasks: () => void
  setReservedGenerationCount(count: number): void
}

/**
 * 生成実行に関わる操作UI
 * @param props
 * @returns
 */
export function GenerationSubmitOperationParts(props: Props) {
  const context = useGenerationContext()

  return (
    <>
      <div className="flex items-center">
        {props.generationMode === "normal" && (
          <GenerationCountSelect
            pass={context.currentPass?.type ?? "FREE"}
            selectedCount={props.generationCount}
            onChange={props.setGenerationCount}
          />
        )}
        {props.generationMode === "reserve" && (
          <GenerationReserveCountInput
            maxCount={
              props.availableImageGenerationMaxTasksCount - props.tasksCount
            }
            onChange={props.setReservedGenerationCount}
            count={props.reservedGenerationCount}
          />
        )}
        <div className="mr-2">枚</div>
        {context.user?.hasSignedImageGenerationTerms === true && (
          <GenerationSubmitButton
            onClick={async () => {
              if (props.generationMode === "reserve") {
                await props.onCreateReservedTask()
              } else {
                await props.onCreateTask()
              }
            }}
            isLoading={props.isCreatingTask}
            isDisabled={context.config.isDisabled}
            generatingCount={
              props.generationMode === "normal"
                ? props.inProgressImageGenerationTasksCount
                : props.inProgressImageGenerationReservedTasksCount
            }
            maxGeneratingCount={
              props.generationMode === "reserve"
                ? props.availableImageGenerationMaxTasksCount - props.tasksCount
                : props.maxTasksCount
            }
            buttonActionCaption={
              props.generationMode === "reserve" ? "予約生成" : "生成"
            }
          />
        )}
        {/* 規約確認開始ボタン */}
        {context.user?.hasSignedImageGenerationTerms !== true && (
          <GenerationTermsButton
            termsMarkdownText={props.termsText}
            onSubmit={props.onSignTerms}
          />
        )}
        {/* 生成キャンセル */}
        {props.generationMode === "reserve" && (
          <GenerationTasksCancelButton
            isDisabled={
              props.inProgressImageGenerationReservedTasksCount === 0 ||
              props.isDeletingReservedTasks
            }
            onCancel={props.onDeleteReservedTasks}
          />
        )}
      </div>
    </>
  )
}