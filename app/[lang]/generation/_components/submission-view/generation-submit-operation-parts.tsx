"use client"

import { LoginDialogButton } from "@/app/[lang]/_components/login-dialog-button"
import { GenerationReserveCountInput } from "@/app/[lang]/generation/_components/submission-view/generation-reserve-count-input"
import { GenerationSubmitButton } from "@/app/[lang]/generation/_components/submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/app/[lang]/generation/_components/submission-view/generation-terms-button"
import { SubscriptionDialogContent } from "@/app/[lang]/generation/_components/submission-view/subscription-dialog-content"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GradientBorderButton } from "@/app/_components/button/gradient-border-button"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2Icon, Minus, Plus } from "lucide-react"
import { useContext } from "react"

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

  const authContext = useContext(AuthContext)

  const isCurrentPremiumPlan = () => {
    if (context.currentPass?.type === "PREMIUM") {
      return true
    }
    return false
  }

  const onMinusButtonClick = () => {
    if (props.generationCount <= 1) {
      return
    }
    props.setGenerationCount(props.generationCount - 1)
  }

  const onPlusButtonClick = () => {
    if (props.generationCount >= props.availableImageGenerationMaxTasksCount) {
      return
    }
    props.setGenerationCount(props.generationCount + 1)
  }

  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center">
          <Button
            className="mr-2 block md:hidden"
            size={"icon"}
            variant={"ghost"}
            onClick={onMinusButtonClick}
          >
            <Minus className="m-auto" />
          </Button>
          <GenerationReserveCountInput
            maxCount={
              props.availableImageGenerationMaxTasksCount - props.tasksCount
            }
            onChange={props.setGenerationCount}
            count={props.generationCount}
          />
          <div className="mr-2 hidden md:block">枚</div>
          <Button
            className="mr-2 block md:hidden"
            size={"icon"}
            variant={"ghost"}
            onClick={onPlusButtonClick}
          >
            <Plus className="m-auto" />
          </Button>
        </div>
        {/* 未ログインならログイン、ユーザ情報取得中もdisabledな状態で表示 */}
        {(!authContext.isLoggedIn || context.user === null) && (
          <LoginDialogButton
            label="生成"
            isLoading={
              authContext.isLoading ||
              (authContext.isLoggedIn && context.user === null)
            }
            isWidthFull={true}
            triggerChildren={
              <GradientBorderButton
                onClick={() => {}}
                className="w-full text-balance"
                children={
                  <>
                    <div className="flex items-center">
                      {"生成"}
                      {(authContext.isLoading ||
                        (authContext.isLoggedIn && context.user === null)) && (
                        <span className="ml-2 animate-spin">
                          <Loader2Icon />
                        </span>
                      )}
                    </div>
                  </>
                }
              />
            }
          />
        )}
        {/* 規約確認開始ボタン */}
        {authContext.isLoggedIn &&
          context.user !== null &&
          context.user?.hasSignedImageGenerationTerms !== true && (
            <GenerationTermsButton
              termsMarkdownText={props.termsText}
              isLoading={props.isCreatingTask}
              onSubmit={props.onSignTerms}
              triggerChildren={
                <GradientBorderButton
                  disabled={props.isCreatingTask}
                  onClick={() => {}}
                  className="w-full text-balance"
                  children={props.isCreatingTask ? "処理中.." : "生成"}
                />
              }
            />
          )}
        {/* プレミアムの場合はサブスク案内ダイアログなしver */}
        {isCurrentPremiumPlan() &&
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
        {/* サブスク案内ダイアログありver（最後の1枚の生成時に案内する） */}
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
        {/* 通常の生成ボタン */}
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
      </div>
    </>
  )
}
