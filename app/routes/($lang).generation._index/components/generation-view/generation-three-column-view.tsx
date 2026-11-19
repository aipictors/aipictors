import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react"
import { Suspense, useContext, useState } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { MemberThanksBanner } from "~/components/member-thanks-banner"
import {
  NewMemberGuide,
  PlanEndingNotice,
} from "~/components/plus-member-notice"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { GenerationAnnouncementBanner } from "~/routes/($lang).generation._index/components/generation-announcement-banner"
import { GenerationCanvasIntro } from "~/routes/($lang).generation._index/components/generation-view/generation-canvas-intro"
import { GenerationSideNav } from "~/routes/($lang).generation._index/components/generation-view/generation-side-nav"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

type Props = {
  /** プロンプト入力（画像の追加・拡大編集・日本語・キーワード） */
  promptEditor: React.ReactNode
  /** ネガティブプロンプト（中央で折りたたむ） */
  negativePromptEditor: React.ReactNode
  /** 履歴など（状態に応じて GenerationAsideView が出し分ける） */
  history: React.ReactNode
  /** 履歴の詳細（中央に大きく出す） */
  taskDetails: React.ReactNode
  /** 右パネル（Model / Styles / Settings + 生成ボタン） */
  panel: React.ReactNode
}

/**
 * 履歴の詳細を中央に出す状態
 */
const detailStates = ["HISTORY_VIEW_ON_MAIN_AND_HEADER"]

/**
 * 履歴・作品を大きく出す状態（右パネルをしまう）
 */
const fullStates = ["HISTORY_LIST_FULL", "WORK_LIST_FULL"]

/**
 * 中央をその画面だけにする状態（左ナビから開く画面）
 */
const pageStates = [
  "WORKS_FROM_MODEL",
  "COMMUNICATION",
  "LINKS",
  "LOGS",
  "COIN_HISTORY",
]

/**
 * PC の画像生成画面（左: メニュー / 中央: プロンプトと生成結果 / 右: 設定と生成ボタン）
 */
export function GenerationThreeColumnView(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const context = useGenerationContext()

  const actor = GenerationConfigContext.useActorRef()

  const state = GenerationConfigContext.useSelector((snap) => {
    return String(snap.value)
  })

  const [isNegativeOpen, setIsNegativeOpen] = useState(false)

  const isFull = fullStates.includes(state)
  const isDetail = detailStates.includes(state)
  const isPage = pageStates.includes(state)
  const isCanvas = !isFull && !isDetail && !isPage

  // 未ログインのときは履歴が無いので、入り口（見出し・おすすめ）を中央に出す
  const showsIntro = isCanvas && authContext.isNotLoggedIn

  const pageTitle =
    state === "WORKS_FROM_MODEL"
      ? t("作品検索", "Search posts")
      : state === "COMMUNICATION"
        ? t("ご意見", "Feedback")
        : state === "LINKS"
          ? t("アンケート", "Survey")
          : state === "LOGS"
            ? t("ログ", "Logs")
            : t("コイン履歴", "Coin history")

  const negativePreview = context.config.negativePromptText.trim()

  const composer = (
    <div className="space-y-2">
      {props.promptEditor}
      <div className="rounded-xl border bg-background">
        <button
          type="button"
          aria-expanded={isNegativeOpen}
          onClick={() => setIsNegativeOpen(!isNegativeOpen)}
          className="flex h-10 w-full items-center gap-2 px-3 text-left text-sm"
        >
          <span className="shrink-0 font-medium">
            {t("ネガティブプロンプト", "Negative prompt")}
          </span>
          {!isNegativeOpen && (
            <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground text-xs">
              {negativePreview === "" ? t("なし", "None") : negativePreview}
            </span>
          )}
          <ChevronDownIcon
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
              isNegativeOpen && "rotate-180",
            )}
          />
        </button>
        {isNegativeOpen && (
          <div className="h-44 border-t [&_.rounded-xl]:rounded-none [&_.rounded-xl]:border-0 [&_.rounded-xl]:shadow-none">
            {props.negativePromptEditor}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="-mx-4 flex h-[calc(100vh-72px)] min-h-[560px] overflow-hidden border-t">
      <GenerationSideNav />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
        <div className="space-y-2 empty:hidden [&>*:first-child]:mt-3 [&>*]:mx-4">
          <GenerationAnnouncementBanner />
          <MemberThanksBanner />
          <PlanEndingNotice variant="banner" />
          <NewMemberGuide />
        </div>

        {showsIntro && (
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-6 py-8">
            <div className="mx-auto w-full max-w-3xl space-y-6">
              <GenerationCanvasIntro />
              {composer}
            </div>
          </div>
        )}

        {isCanvas && !showsIntro && (
          <>
            <div className="shrink-0 px-4 pt-3">
              <div className="mx-auto w-full max-w-5xl">{composer}</div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-y-2 overflow-hidden px-4 pt-3 pb-2">
              <Suspense fallback={<AppLoadingPage />}>{props.history}</Suspense>
            </div>
          </>
        )}

        {isDetail && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pt-3 pb-2">
            <Suspense fallback={<AppLoadingPage />}>
              {props.taskDetails}
            </Suspense>
          </div>
        )}

        {(isPage || isFull) && (
          <div className="flex min-h-0 flex-1 flex-col gap-y-2 overflow-hidden px-4 pt-3 pb-2">
            {isPage && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => actor.send({ type: "CLOSE" })}
                  aria-label={t("画像生成に戻る", "Back to generation")}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeftIcon className="size-4" />
                </button>
                <h2 className="font-semibold text-base">{pageTitle}</h2>
              </div>
            )}
            <Suspense fallback={<AppLoadingPage />}>{props.history}</Suspense>
          </div>
        )}
      </main>

      {!isFull && (
        <div className="flex w-[340px] shrink-0 border-l xl:w-[372px]">
          <Suspense fallback={<AppLoadingPage />}>{props.panel}</Suspense>
        </div>
      )}
    </div>
  )
}
