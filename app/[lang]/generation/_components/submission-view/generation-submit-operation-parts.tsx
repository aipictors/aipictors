"use client"

import { LoginDialogButton } from "@/app/[lang]/_components/login-dialog-button"
import { GenerationCountSelect } from "@/app/[lang]/generation/_components/submission-view/generation-count-select"
import { GenerationReserveCountInput } from "@/app/[lang]/generation/_components/submission-view/generation-reserve-count-input"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/submission-view/generation-terms-button"
import { SubscriptionDialogContent } from "@/app/[lang]/generation/_components/submission-view/subscription-dialog-content"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTasksCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-tasks-cancel-button"
import { GradientBorderButton } from "@/app/_components/button/gradient-border-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Props = {
  isCreatingTask: boolean
  inProgressImageGenerationTasksCount: number
  inProgressImageGenerationReservedTasksCount: number
  maxTasksCount: number
  tasksCount: number
  termsText: string
  availableImageGenerationMaxTasksCount: number
  generationCount: number
  setGenerationCount: (count: number) => void
  onCreateTask: () => void
  onSignTerms: () => void
}

/**
 * 生成ボタンのラベル
 * @param mode
 * @param isSetI2iImage
 * @returns
 */
export function getSubmitButtonLabel(
  isSetI2iImage: boolean,
  prompts: string,
  seed: number,
) {
  const seedLabel = seed === -1 ? "" : "(Seed固定)"

  if (!prompts) {
    if (isSetI2iImage) {
      return `画像からランダム生成${seedLabel}`
    }
    return `ランダム生成${seedLabel}`
  }
  if (isSetI2iImage) {
    return `画像から生成${seedLabel}`
  }
  return `生成${seedLabel}`
}

/**
 * 生成実行に関わる操作UI
 * @param props
 * @returns
 */
export function GenerationSubmitOperationParts(props: Props) {
  const context = useGenerationContext()

  const isCurrentPremiumPlan = () => {
    if (context.currentPass?.type === "PREMIUM") {
      return true
    }
    return false
  }

  return (
    <>
      <div className="flex items-center">
        <GenerationReserveCountInput
          maxCount={
            props.availableImageGenerationMaxTasksCount - props.tasksCount
          }
          onChange={props.setGenerationCount}
          count={props.generationCount}
        />
        <div className="mr-2">枚</div>
        {/* プレミアムの場合はサブスク案内ダイアログはなし */}
        {isCurrentPremiumPlan() && (
          <GenerationSubmitButton
            onClick={async () => {
              await props.onCreateTask()
            }}
            isLoading={props.isCreatingTask}
            isDisabled={context.config.isDisabled}
            generatingCount={
              props.inProgressImageGenerationTasksCount +
              props.inProgressImageGenerationReservedTasksCount
            }
            maxGeneratingCount={
              props.availableImageGenerationMaxTasksCount - props.tasksCount
            }
            buttonActionCaption={getSubmitButtonLabel(
              context.config.i2iImageBase64 ? true : false,
              context.config.promptText,
              context.config.seed,
            )}
          />
        )}
        {/* 生成上限に達した場合はサブスク案内ダイアログ */}
        {!isCurrentPremiumPlan() &&
          props.tasksCount < props.availableImageGenerationMaxTasksCount - 1 &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <GenerationSubmitButton
              onClick={async () => {
                await props.onCreateTask()
              }}
              isLoading={props.isCreatingTask}
              isDisabled={context.config.isDisabled}
              generatingCount={
                props.inProgressImageGenerationTasksCount +
                props.inProgressImageGenerationReservedTasksCount
              }
              maxGeneratingCount={
                props.availableImageGenerationMaxTasksCount - props.tasksCount
              }
              buttonActionCaption={getSubmitButtonLabel(
                context.config.i2iImageBase64 ? true : false,
                context.config.promptText,
                context.config.seed,
              )}
            />
          )}

        {!isCurrentPremiumPlan() &&
          props.tasksCount >= props.availableImageGenerationMaxTasksCount - 1 &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <Dialog>
              <DialogTrigger asChild>
                <GenerationSubmitButton
                  onClick={async () => {
                    await props.onCreateTask()
                  }}
                  isLoading={props.isCreatingTask}
                  isDisabled={context.config.isDisabled}
                  generatingCount={
                    props.inProgressImageGenerationTasksCount +
                    props.inProgressImageGenerationReservedTasksCount
                  }
                  maxGeneratingCount={
                    props.availableImageGenerationMaxTasksCount -
                    props.tasksCount
                  }
                  buttonActionCaption={getSubmitButtonLabel(
                    context.config.i2iImageBase64 ? true : false,
                    context.config.promptText,
                    context.config.seed,
                  )}
                />
              </DialogTrigger>
              <DialogContent className="min-w-[64vw]">
                <DialogHeader>
                  <DialogTitle>
                    {
                      "Aipictorsの生成機能をご利用いただき、ありがとうございます。"
                    }
                  </DialogTitle>
                  <DialogDescription>
                    {
                      "Aipictors+に加入することで生成枚数などの特典を受けることができます。"
                    }
                  </DialogDescription>
                </DialogHeader>
                <SubscriptionDialogContent />
              </DialogContent>
            </Dialog>
          )}

        {/* 未ログインならログイン */}
        {context.user === null && (
          <LoginDialogButton
            label="生成"
            isWidthFull={true}
            triggerChildren={
              <GradientBorderButton
                onClick={() => {}}
                className="w-full text-balance"
                children={"生成"}
              />
            }
          />
        )}
        {/* 規約確認開始ボタン */}
        {context.user !== null &&
          context.user?.hasSignedImageGenerationTerms !== true && (
            <GenerationTermsButton
              termsMarkdownText={props.termsText}
              onSubmit={props.onSignTerms}
              triggerChildren={
                <GradientBorderButton
                  onClick={() => {}}
                  className="w-full text-balance"
                  children={"生成"}
                />
              }
            />
          )}
      </div>
    </>
  )
}
