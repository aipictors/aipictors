import { GradientBlueButton } from "@/_components/button/gradient-blue-button"
import { GradientBorderButton } from "@/_components/button/gradient-border-button"
import { LoginDialogButton } from "@/_components/login-dialog-button"
import { Button } from "@/_components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu"
import { Label } from "@/_components/ui/label"
import { Switch } from "@/_components/ui/switch"
import { AuthContext } from "@/_contexts/auth-context"
import { config } from "@/config"
import { GenerationReserveCountInput } from "@/routes/($lang).generation._index/_components/submission-view/generation-reserve-count-input"
import { GenerationSubmitButton } from "@/routes/($lang).generation._index/_components/submission-view/generation-submit-button"
import { GenerationTermsButton } from "@/routes/($lang).generation._index/_components/submission-view/generation-terms-button"
import { SubscriptionDialogContent } from "@/routes/($lang).generation._index/_components/submission-view/subscription-dialog-content"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { Loader2Icon, Minus, Plus, SettingsIcon } from "lucide-react"
import { useContext } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  isCreatingTask: boolean
  inProgressImageGenerationTasksCount: number
  inProgressImageGenerationReservedTasksCount: number
  maxTasksCount: number
  tasksCount: number
  termsText: string
  availableImageGenerationMaxTasksCount: number
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
    if (context.config.generationCount <= 1) {
      return
    }
    context.changeGenerationCount(context.config.generationCount - 1)
  }

  const onPlusButtonClick = () => {
    if (
      context.config.generationCount >=
      props.availableImageGenerationMaxTasksCount
    ) {
      return
    }
    context.changeGenerationCount(context.config.generationCount + 1)
  }

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <div className="flex items-center">
        {!isDesktop && (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="block md:hidden">
                <Button
                  className="mr-2"
                  size={"icon"}
                  variant={"ghost"}
                  onClick={onMinusButtonClick}
                >
                  <SettingsIcon className="m-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="flex items-center p-2">
                  <Button
                    className="mr-2"
                    size={"icon"}
                    variant={"ghost"}
                    onClick={onMinusButtonClick}
                  >
                    <Minus className="m-auto" />
                  </Button>
                  <GenerationReserveCountInput
                    maxCount={
                      props.availableImageGenerationMaxTasksCount -
                      props.tasksCount
                    }
                    onChange={context.changeGenerationCount}
                    count={context.config.generationCount}
                  />
                  {"枚"}
                  <Button
                    className="mr-2"
                    size={"icon"}
                    variant={"ghost"}
                    onClick={onPlusButtonClick}
                  >
                    <Plus className="m-auto" />
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden items-center md:flex">
              <GenerationReserveCountInput
                maxCount={
                  props.availableImageGenerationMaxTasksCount - props.tasksCount
                }
                onChange={context.changeGenerationCount}
                count={context.config.generationCount}
              />
              <div className="mr-2">枚</div>
            </div>
          </div>
        )}
        {/* 未ログインならログイン、ユーザ情報取得中もdisabledな状態で表示 */}
        {(!authContext.isLoggedIn || context.user === null) && (
          <>
            <div className="mr-2 flex w-56 items-center space-x-2 md:w-48">
              <Switch
                onClick={() => {
                  context.changeUpscaleSize(
                    context.config.upscaleSize === 2 ? 1 : 2,
                  )
                }}
                checked={context.config.upscaleSize === 2}
                id="extras-mode"
              />
              <div className="text-center leading-3">
                <Label htmlFor="extras-mode" className="block text-center">
                  高解像度
                </Label>
                <Label
                  htmlFor="extras-mode"
                  className="block text-center text-xs"
                >
                  2枚消費
                </Label>
              </div>
            </div>
            <LoginDialogButton
              label="生成"
              isLoading={
                authContext.isLoading ||
                (authContext.isLoggedIn && context.user === null)
              }
              isWidthFull={true}
              triggerChildren={
                <GradientBlueButton
                  onClick={() => {}}
                  className="w-full text-balance"
                  isNoBackground={true}
                >
                  <div className="flex items-center">
                    {"生成"}
                    {(authContext.isLoading ||
                      (authContext.isLoggedIn && context.user === null)) && (
                      <span className="ml-2 animate-spin">
                        <Loader2Icon />
                      </span>
                    )}
                  </div>
                </GradientBlueButton>
              }
            />
          </>
        )}
        {/* 規約確認開始ボタン */}
        {authContext.isLoggedIn &&
          context.user !== null &&
          context.user?.hasSignedImageGenerationTerms !== true && (
            <>
              <div className="mr-2 flex w-56 items-center space-x-2 md:w-48">
                <Switch
                  onClick={() => {
                    context.changeUpscaleSize(
                      context.config.upscaleSize === 2 ? 1 : 2,
                    )
                  }}
                  checked={context.config.upscaleSize === 2}
                  id="extras-mode"
                />
                <div className="text-center leading-3">
                  <Label htmlFor="extras-mode" className="block text-center">
                    高解像度
                  </Label>
                  <Label
                    htmlFor="extras-mode"
                    className="block text-center text-xs"
                  >
                    2枚消費
                  </Label>
                </div>
              </div>

              <GenerationTermsButton
                termsMarkdownText={props.termsText}
                isLoading={props.isCreatingTask}
                onSubmit={props.onSignTerms}
                triggerChildren={
                  <GradientBorderButton
                    disabled={props.isCreatingTask}
                    onClick={() => {}}
                    className="w-full text-balance"
                    isNoBackground={true}
                  >
                    {props.isCreatingTask ? "処理中.." : "生成"}
                  </GradientBorderButton>
                }
              />
            </>
          )}
        {/* プレミアムの場合はサブスク案内ダイアログなしver */}
        {isCurrentPremiumPlan() &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <>
              <div className="mr-2 flex w-56 items-center space-x-2 md:w-48">
                <Switch
                  onClick={() => {
                    context.changeUpscaleSize(
                      context.config.upscaleSize === 2 ? 1 : 2,
                    )
                  }}
                  checked={context.config.upscaleSize === 2}
                  id="extras-mode"
                />
                <div className="text-center leading-3">
                  <Label htmlFor="extras-mode" className="block text-center">
                    高解像度
                  </Label>
                  <Label
                    htmlFor="extras-mode"
                    className="block text-center text-xs"
                  >
                    2枚消費
                  </Label>
                </div>
              </div>
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
                  !!context.config.i2iImageBase64,
                  context.config.promptText,
                  context.config.seed,
                )}
              />
            </>
          )}
        {/* サブスク案内ダイアログありver（最後の1枚の生成時に案内する） */}
        {!isCurrentPremiumPlan() &&
          props.tasksCount <
            props.availableImageGenerationMaxTasksCount -
              (context.config.upscaleSize === 2 ? 2 : 1) &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <>
              <div className="mr-2 flex w-56 items-center space-x-2 md:w-48">
                <Switch
                  onClick={() => {
                    context.changeUpscaleSize(
                      context.config.upscaleSize === 2 ? 1 : 2,
                    )
                  }}
                  checked={context.config.upscaleSize === 2}
                  id="extras-mode"
                />
                <div className="text-center leading-3">
                  <Label htmlFor="extras-mode" className="block text-center">
                    高解像度
                  </Label>
                  <Label
                    htmlFor="extras-mode"
                    className="block text-center text-xs"
                  >
                    2枚消費
                  </Label>
                </div>
              </div>

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
                  !!context.config.i2iImageBase64,
                  context.config.promptText,
                  context.config.seed,
                )}
              />
            </>
          )}
        {/* 通常の生成ボタン */}
        {!isCurrentPremiumPlan() &&
          props.tasksCount >=
            props.availableImageGenerationMaxTasksCount -
              (context.config.upscaleSize === 2 ? 2 : 1) &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex w-full items-center space-x-2">
                  <div className="flex w-48 items-center md:w-40">
                    <Switch
                      onClick={() => {
                        context.changeUpscaleSize(
                          context.config.upscaleSize === 2 ? 1 : 2,
                        )
                      }}
                      checked={context.config.upscaleSize === 2}
                      id="extras-mode"
                    />
                    <div className="text-center leading-3">
                      <Label
                        htmlFor="extras-mode"
                        className="block text-center"
                      >
                        高解像度
                      </Label>
                      <Label
                        htmlFor="extras-mode"
                        className="block text-center text-xs"
                      >
                        2枚消費
                      </Label>
                    </div>
                  </div>
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
                      !!context.config.i2iImageBase64,
                      context.config.promptText,
                      context.config.seed,
                    )}
                  />
                </div>
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
