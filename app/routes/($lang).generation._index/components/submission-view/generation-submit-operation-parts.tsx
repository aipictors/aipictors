import { GradientBlueButton } from "~/components/button/gradient-blue-button"
import { GradientBorderButton } from "~/components/button/gradient-border-button"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { GenerationReserveCountInput } from "~/routes/($lang).generation._index/components/submission-view/generation-reserve-count-input"
import { GenerationSubmitButton } from "~/routes/($lang).generation._index/components/submission-view/generation-submit-button"
import { GenerationTermsButton } from "~/routes/($lang).generation._index/components/submission-view/generation-terms-button"
import { SubscriptionDialogContent } from "~/routes/($lang).generation._index/components/submission-view/subscription-dialog-content"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { Loader2Icon, Minus, Plus, SettingsIcon } from "lucide-react"
import { useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"

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
 * @param isSetI2iImage
 * @param prompts
 * @param seed
 */
export function getSubmitButtonLabel(
  isSetI2iImage: boolean,
  prompts: string,
  seed: number,
  inProgressImageGenerationTasksCount: number,
) {
  const t = useTranslation()

  const seedLabel = seed === -1 ? "" : t("(Seed固定)", "(Seed fixed)")

  if (!prompts) {
    if (isSetI2iImage) {
      return t(
        `画像からランダム生成${seedLabel}`,
        `Random generation from image ${seedLabel}`,
      )
    }
    return t(`ランダム生成${seedLabel}`, `Random generation ${seedLabel}`)
  }
  if (isSetI2iImage) {
    return t(`画像から生成${seedLabel}`, `Generate from image ${seedLabel}`)
  }
  if (inProgressImageGenerationTasksCount > 0) {
    return t(`追加生成${seedLabel}`, `Add generation ${seedLabel}`)
  }
  return t(`生成${seedLabel}`, `Generate ${seedLabel}`)
}

/**
 * 生成実行に関わる操作UI
 */
export function GenerationSubmitOperationParts(props: Props) {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)
  const t = useTranslation()

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

  const generatingCount =
    props.inProgressImageGenerationTasksCount +
    props.inProgressImageGenerationReservedTasksCount

  return (
    <>
      <div className="flex items-center">
        <div className="flex items-center md:hidden">
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
                {t("枚", "pieces")}
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
            <div className="mr-2">{t("枚", "pieces")}</div>
          </div>
        </div>
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
                  {t("高解像度", "High Resolution")}
                </Label>
                <Label
                  htmlFor="extras-mode"
                  className="block text-center text-xs"
                >
                  {t("2枚消費", "Consumes 2 pieces")}
                </Label>
              </div>
            </div>
            <LoginDialogButton
              label={t("生成", "Generate")}
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
                    {t("生成", "Generate")}
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
                  {props.isCreatingTask
                    ? t("処理中..", "Processing..")
                    : t("生成", "Generate")}
                </GradientBorderButton>
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
              generatingCount={generatingCount}
              maxGeneratingCount={
                props.availableImageGenerationMaxTasksCount - props.tasksCount
              }
              buttonActionCaption={getSubmitButtonLabel(
                !!context.config.i2iImageBase64,
                context.config.promptText,
                context.config.seed,
                generatingCount,
              )}
            />
          )}
        {/* サブスク案内ダイアログありver（最後の1枚の生成時に案内する） */}
        {!isCurrentPremiumPlan() &&
          props.tasksCount <
            props.availableImageGenerationMaxTasksCount -
              (context.config.upscaleSize === 2 ? 2 : 1) &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <GenerationSubmitButton
              onClick={async () => {
                await props.onCreateTask()
              }}
              isLoading={props.isCreatingTask}
              isDisabled={context.config.isDisabled}
              generatingCount={generatingCount}
              maxGeneratingCount={
                props.availableImageGenerationMaxTasksCount - props.tasksCount
              }
              buttonActionCaption={getSubmitButtonLabel(
                !!context.config.i2iImageBase64,
                context.config.promptText,
                context.config.seed,
                generatingCount,
              )}
            />
          )}
        {/* 通常の生成ボタン */}
        {!isCurrentPremiumPlan() &&
          props.tasksCount >=
            props.availableImageGenerationMaxTasksCount -
              (context.config.upscaleSize === 2 ? 2 : 1) &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="flex w-full items-center space-x-4">
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
                        {t("高解像度", "High Resolution")}
                      </Label>
                      <Label
                        htmlFor="extras-mode"
                        className="block text-center text-xs"
                      >
                        {t("2枚消費", "Consumes 2 pieces")}
                      </Label>
                    </div>
                  </div>
                  <GenerationSubmitButton
                    onClick={async () => {
                      await props.onCreateTask()
                    }}
                    isLoading={props.isCreatingTask}
                    isDisabled={context.config.isDisabled}
                    generatingCount={generatingCount}
                    maxGeneratingCount={
                      props.availableImageGenerationMaxTasksCount -
                      props.tasksCount
                    }
                    buttonActionCaption={getSubmitButtonLabel(
                      !!context.config.i2iImageBase64,
                      context.config.promptText,
                      context.config.seed,
                      generatingCount,
                    )}
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="min-w-[64vw]">
                <DialogHeader>
                  <DialogTitle>
                    {t(
                      "Aipictorsの生成機能をご利用いただき、ありがとうございます。",
                      "Thank you for using Aipictors' generation feature.",
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    {t(
                      "Aipictors+に加入することで生成枚数などの特典を受けることができます。",
                      "By subscribing to Aipictors+, you can enjoy additional benefits like increased generation count.",
                    )}
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
