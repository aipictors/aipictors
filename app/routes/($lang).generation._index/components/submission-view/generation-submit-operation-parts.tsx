import { isUpscaleOverFreeLimit } from "~/routes/($lang).generation._index/types/generation-size"
import { getGenerationSizeMultiplier } from "~/routes/($lang).generation._index/utils/generation-submit-coin"
import { GradientBlueButton } from "~/components/button/gradient-blue-button"
import { GradientBorderButton } from "~/components/button/gradient-border-button"
import { CoinIcon } from "~/components/coin-icon"
import { LoginDialogButton } from "~/components/login-dialog-button"
import { PremiumCoinIcon } from "~/components/premium-coin-icon"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { AuthContext } from "~/contexts/auth-context"
import { Link } from "~/lib/app/locale-router"
import { GenerationServerStatusBadge } from "~/routes/($lang).generation._index/components/submission-view/generation-server-status-badge"
import { GenerationReserveCountInput } from "~/routes/($lang).generation._index/components/submission-view/generation-reserve-count-input"
import { GenerationSubmitButton } from "~/routes/($lang).generation._index/components/submission-view/generation-submit-button"
import { GenerationTermsButton } from "~/routes/($lang).generation._index/components/submission-view/generation-terms-button"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import {
  HistoryIcon,
  Loader2Icon,
  Minus,
  Plus,
  SettingsIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { useContext } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { useGenerationPlanHint } from "~/routes/($lang).generation._index/hooks/use-generation-plan-hint"
import { trackGrowthEvent } from "~/utils/track-growth-event"
import { cn } from "~/lib/utils"

type Props = {
  /** 1 回の生成で作る枚数 */
  imagesPerRequest?: number
  isCreatingTask: boolean
  inProgressImageGenerationTasksCount: number
  inProgressImageGenerationReservedTasksCount: number
  maxTasksCount: number
  remainingImageGenerationTasksCount: number
  isCoinSummaryLoading: boolean
  requestCoinCost: number
  ownedCoinCount: number
  freeCoinBalance: number
  premiumCoinBalance: number
  termsText: string
  availableImageGenerationMaxTasksCount: number
  /** 画像生成のメンテナンス中（生成ボタンを押せなくする） */
  isMaintenance?: boolean
  /**
   * スマホのアプリと同じ構成（枚数・予約・高解像度は上のカードにあるので、ここは使うコインと生成ボタンだけ）
   */
  isMobileApp?: boolean
  /**
   * スマホ: 生成ボタンの左に出す「履歴へ」（つくるの間）/「つくる」（履歴の間）のボタン
   */
  mobileSwitch?: {
    target: "create" | "history"
    runningCount: number
    onClick: () => void
  }
  onCreateTask: () => void
  onSignTerms: () => void
}

const formatCoinAmount = (value: number) => {
  return value.toLocaleString()
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
      context.config.generationCount >= props.remainingImageGenerationTasksCount
    ) {
      return
    }
    context.changeGenerationCount(context.config.generationCount + 1)
  }

  const generatingCount =
    props.inProgressImageGenerationTasksCount +
    props.inProgressImageGenerationReservedTasksCount

  /**
   * 1 回の生成で使う「通常 1 枚分」の数（高解像度は 2 枚分）
   */
  const sizeMultiplier = getGenerationSizeMultiplier(context.config.sizeType)

  const requestImageUnits =
    (props.imagesPerRequest ?? 1) *
    (context.config.upscaleSize === 2 ? 2 : 1) *
    sizeMultiplier

  const passType = context.currentPass?.type

  // 無料の人には、生成が終わった直後にプランの案内を 1 行出す（1 日 1 回）
  useGenerationPlanHint(
    authContext.isLoggedIn &&
      !props.isCoinSummaryLoading &&
      context.currentPass === null,
  )

  // サブスクでない人は拡大後のサイズも 2048×2048 まで
  const isUpscaleDisabled = isUpscaleOverFreeLimit(
    context.config.sizeType,
    passType === "LITE" || passType === "STANDARD" || passType === "PREMIUM",
  )

  /**
   * ボタンの文言に 1 回で作る枚数を添える（例: 生成 ×4枚）
   */
  const withImageCount = (label: string) => {
    const count = props.imagesPerRequest ?? 1
    // スマホは 1 枚のときも出して、上の枚数の選択と同じ数が見えるようにする
    return count > 1 || props.isMobileApp
      ? t(`${label} ×${count}枚`, `${label} ×${count}`)
      : label
  }

  /**
   * スマホの生成ボタン（アプリと同じ大きな丸いボタン）
   */
  const mobileSubmitClassName = props.isMobileApp
    ? "h-14 rounded-full from-[#0170C8] via-[#6D5DF6] to-[#FF5C8A] bg-linear-to-r shadow-[0_8px_20px_rgba(109,93,246,0.35)] dark:from-[#0170C8] dark:to-[#FF5C8A] [&>div]:rounded-full [&_span.truncate]:text-[17px] [&_span.truncate]:font-extrabold"
    : undefined

  const isCoinShort =
    !props.isCoinSummaryLoading && props.ownedCoinCount < props.requestCoinCost

  return (
    <>
      {!authContext.isLoggedIn && (
        <div className="flex items-center justify-end px-1">
          <GenerationServerStatusBadge />
        </div>
      )}
      {authContext.isLoggedIn && props.isMobileApp && (
        <div className="flex items-center gap-2 px-1 text-xs leading-none">
          <span
            className={cn(
              "flex min-w-0 items-center gap-1 font-bold",
              isCoinShort
                ? "text-pink-600 dark:text-pink-400"
                : "text-muted-foreground",
            )}
          >
            <CoinIcon className="size-3.5 shrink-0" />
            <span className="truncate tabular-nums">
              {props.isCoinSummaryLoading
                ? t(
                    `使うコイン ${formatCoinAmount(props.requestCoinCost)}`,
                    `Uses ${formatCoinAmount(props.requestCoinCost)} coins`,
                  )
                : t(
                    `使うコイン ${formatCoinAmount(props.requestCoinCost)}・残り`,
                    `Uses ${formatCoinAmount(props.requestCoinCost)} · left`,
                  )}
            </span>
            {/* フリーとプレミアムは価値が違うので、残りは分けて出す */}
            {!props.isCoinSummaryLoading && (
              <>
                <CoinIcon className="size-3.5 shrink-0" />
                <span className="tabular-nums">
                  {formatCoinAmount(props.freeCoinBalance)}
                </span>
                <PremiumCoinIcon className="size-3.5 shrink-0" />
                <span className="tabular-nums">
                  {formatCoinAmount(props.premiumCoinBalance)}
                </span>
              </>
            )}
          </span>
          {/* 無料で残りが少ないときは、プランの案内を小さく出す（1枚 10 コイン） */}
          {!context.currentPass?.type &&
            !props.isCoinSummaryLoading &&
            props.ownedCoinCount < 40 && (
              <Link
                to="/plus#plans"
                onClick={() => trackGrowthEvent("lowcoin_click", "free")}
                className="shrink-0 rounded-full bg-fuchsia-600 px-3 py-2 font-medium text-[11px] text-white shadow-sm"
              >
                {t(
                  `あと${Math.floor(props.ownedCoinCount / 10)}枚・プランなら1日50枚〜`,
                  `${Math.floor(props.ownedCoinCount / 10)} left today · get 50+ a day`,
                )}
              </Link>
            )}
          <GenerationServerStatusBadge className="ml-auto" />
        </div>
      )}
      {authContext.isLoggedIn && !props.isMobileApp && (
        <div className="flex items-center gap-2 px-1 text-[11px] leading-none text-muted-foreground">
          <Link
            to="/settings/points"
            className="shrink-0 rounded-full border border-border/60 bg-background/95 px-3 py-2 text-[11px] font-medium text-foreground/80 shadow-sm"
          >
            詳細
          </Link>
          <div className="flex min-w-0 items-center gap-1 rounded-full border border-border/60 bg-background/95 px-3 py-2 shadow-sm">
            <CoinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {formatCoinAmount(props.freeCoinBalance)}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1 rounded-full border border-border/60 bg-background/95 px-3 py-2 shadow-sm">
            <PremiumCoinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {formatCoinAmount(props.premiumCoinBalance)}
            </span>
          </div>
          {/* 無料で残りが少ないときは、プランの案内を小さく出す（1枚 10 コイン） */}
          {!context.currentPass?.type &&
            !props.isCoinSummaryLoading &&
            props.ownedCoinCount < 40 && (
              <Link
                to="/plus#plans"
                onClick={() => trackGrowthEvent("lowcoin_click", "free")}
                className="shrink-0 rounded-full bg-fuchsia-600 px-3 py-2 font-medium text-[11px] text-white shadow-sm"
              >
                {t(
                  `あと${Math.floor(props.ownedCoinCount / 10)}枚・プランなら1日50枚〜`,
                  `${Math.floor(props.ownedCoinCount / 10)} left today · get 50+ a day`,
                )}
              </Link>
            )}
          <GenerationServerStatusBadge className="ml-auto" />
        </div>
      )}
      <div className="flex min-w-0 items-center">
        {props.mobileSwitch && (
          <button
            type="button"
            onClick={props.mobileSwitch.onClick}
            className="relative mr-2 flex h-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full bg-muted px-4 font-bold text-[11px] text-foreground/80 active:scale-95"
          >
            {props.mobileSwitch.target === "history" ? (
              <HistoryIcon className="size-5" />
            ) : (
              <SlidersHorizontalIcon className="size-5" />
            )}
            {props.mobileSwitch.target === "history"
              ? t("履歴", "History")
              : t("つくる", "Create")}
            {props.mobileSwitch.target === "history" &&
              props.mobileSwitch.runningCount > 0 && (
                <span className="-top-1 -right-1 absolute flex size-5 items-center justify-center rounded-full bg-pink-500 font-black text-[10px] text-white tabular-nums">
                  {props.mobileSwitch.runningCount}
                </span>
              )}
          </button>
        )}
        {!props.isMobileApp && (
          <div className="flex shrink-0 items-center md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={t("生成の設定", "Generation settings")}
                  className="mr-2 block md:hidden"
                  size={"icon"}
                  variant={"ghost"}
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
                    maxCount={props.remainingImageGenerationTasksCount}
                    onChange={context.changeGenerationCount}
                    count={context.config.generationCount}
                  />
                  {t("回", "times")}
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
                maxCount={props.remainingImageGenerationTasksCount}
                onChange={context.changeGenerationCount}
                count={context.config.generationCount}
              />
              <div className="mr-2">{t("回", "times")}</div>
            </div>
          </div>
        )}
        {/* 未ログインならログイン、ユーザ情報取得中もdisabledな状態で表示 */}
        {(!authContext.isLoggedIn || context.user === null) && (
          <>
            {!props.isMobileApp && (
              <div className="mr-2 flex shrink-0 items-center gap-1.5">
                <Switch
                  onClick={() => {
                    context.changeUpscaleSize(
                      context.config.upscaleSize === 2 ? 1 : 2,
                    )
                  }}
                  checked={context.config.upscaleSize === 2}
                  disabled={isUpscaleDisabled}
                  id="extras-mode"
                />
                <div className="text-center leading-3">
                  <Label
                    htmlFor="extras-mode"
                    className="block whitespace-nowrap text-center text-xs sm:text-sm"
                  >
                    {t("高解像度", "High Resolution")}
                  </Label>
                  <Label
                    htmlFor="extras-mode"
                    className="block whitespace-nowrap text-center text-[10px] sm:text-xs"
                  >
                    {t(
                      `1枚・コイン${sizeMultiplier * 2}倍`,
                      `1 image, ${sizeMultiplier * 2}x coins`,
                    )}
                  </Label>
                </div>
              </div>
            )}
            <div data-generation-submit className="contents">
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
                    className={cn("w-full text-balance", mobileSubmitClassName)}
                    disabled={props.isMaintenance === true}
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
            </div>
          </>
        )}
        {/* 規約確認開始ボタン */}
        {authContext.isLoggedIn &&
          context.user !== null &&
          context.user?.hasSignedImageGenerationTerms !== true && (
            <div data-generation-submit className="contents">
              <GenerationTermsButton
                termsMarkdownText={props.termsText}
                isLoading={props.isCreatingTask}
                onSubmit={props.onSignTerms}
                triggerChildren={
                  <GradientBorderButton
                    disabled={
                      props.isCreatingTask || props.isMaintenance === true
                    }
                    onClick={() => {}}
                    className={cn(
                      "w-full text-balance",
                      props.isMobileApp && "h-14 rounded-full",
                    )}
                    isNoBackground={true}
                  >
                    {props.isCreatingTask
                      ? t("処理中..", "Processing..")
                      : t("生成", "Generate")}
                  </GradientBorderButton>
                }
              />
            </div>
          )}
        {/* プレミアムの場合はサブスク案内ダイアログなしver */}
        {isCurrentPremiumPlan() &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <GenerationSubmitButton
              className={mobileSubmitClassName}
              onClick={async () => {
                await props.onCreateTask()
              }}
              isLoading={props.isCreatingTask}
              isDisabled={
                context.config.isDisabled || props.isMaintenance === true
              }
              isCoinSummaryLoading={props.isCoinSummaryLoading}
              requestCoinCost={props.requestCoinCost}
              ownedCoinCount={props.ownedCoinCount}
              buttonActionCaption={
                props.isMaintenance === true
                  ? t("メンテナンス中", "Under maintenance")
                  : withImageCount(
                      getSubmitButtonLabel(
                        !!context.config.i2iImageBase64,
                        context.config.promptText,
                        context.config.seed,
                        generatingCount,
                      ),
                    )
              }
            />
          )}
        {/* プレミアム以外（コインが足りないときは送る前にプラン・コイン購入の案内を出すので、ここでは案内しない） */}
        {!isCurrentPremiumPlan() &&
          context.user?.hasSignedImageGenerationTerms === true && (
            <div className="flex w-full min-w-0 items-center gap-3">
              {!props.isMobileApp && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <Switch
                    onClick={() => {
                      context.changeUpscaleSize(
                        context.config.upscaleSize === 2 ? 1 : 2,
                      )
                    }}
                    checked={context.config.upscaleSize === 2}
                    disabled={isUpscaleDisabled}
                    id="extras-mode"
                  />
                  <div className="text-center leading-3">
                    <Label
                      htmlFor="extras-mode"
                      className="block whitespace-nowrap text-center text-xs sm:text-sm"
                    >
                      {t("高解像度", "High Resolution")}
                    </Label>
                    <Label
                      htmlFor="extras-mode"
                      className="block whitespace-nowrap text-center text-[10px] sm:text-xs"
                    >
                      {t(
                        `1枚・コイン${sizeMultiplier * 2}倍`,
                        `1 image, ${sizeMultiplier * 2}x coins`,
                      )}
                    </Label>
                  </div>
                </div>
              )}
              <GenerationSubmitButton
                className={mobileSubmitClassName}
                onClick={async () => {
                  await props.onCreateTask()
                }}
                isLoading={props.isCreatingTask}
                isDisabled={
                  context.config.isDisabled || props.isMaintenance === true
                }
                isCoinSummaryLoading={props.isCoinSummaryLoading}
                requestCoinCost={props.requestCoinCost}
                ownedCoinCount={props.ownedCoinCount}
                buttonActionCaption={
                  props.isMaintenance === true
                    ? t("メンテナンス中", "Under maintenance")
                    : withImageCount(
                        getSubmitButtonLabel(
                          !!context.config.i2iImageBase64,
                          context.config.promptText,
                          context.config.seed,
                          generatingCount,
                        ),
                      )
                }
              />
            </div>
          )}
      </div>
    </>
  )
}
