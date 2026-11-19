import {
  ArrowRightIcon,
  CheckIcon,
  LightbulbIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { LazyLoginDialogContent } from "~/components/lazy-login-dialog-content"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Skeleton } from "~/components/ui/skeleton"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { useApplyGenerationEntryPrompt } from "~/routes/($lang).generation._index/hooks/use-generation-auto-submit"
import {
  readGenerationPendingPrompt,
  saveGenerationPendingPrompt,
} from "~/routes/($lang).generation._index/utils/generation-simple-entry"
import {
  GENERATION_SIMPLE_ENTRY_EXAMPLES,
  type GenerationSimpleEntryExample,
} from "~/routes/($lang).generation._index/utils/generation-simple-entry-examples"

type Props = {
  /**
   * 詳細画面に切り替える（次からも詳細画面で開く）
   */
  onOpenAdvanced: () => void
}

/**
 * はじめての人向けのかんたん入口。書いて「生成する」を押すだけ
 * - モデル・サイズ・ネガティブプロンプトは詳細画面のおすすめの初期値のまま
 * - 押したら詳細画面に切り替えて、そのプロンプトで生成を始める（未ログインならログインのあと）
 */
export function GenerationSimpleEntry(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const applyPrompt = useApplyGenerationEntryPrompt()

  // ログインを途中でやめて戻ってきたときも、書いた内容を残す
  const [prompt, setPrompt] = useState(
    () => readGenerationPendingPrompt()?.prompt ?? "",
  )

  const [hint, setHint] = useState<string | null>(null)

  const [isHighlighted, setIsHighlighted] = useState(false)

  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const formRef = useRef<HTMLDivElement>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isHighlighted) return
    const timer = window.setTimeout(() => setIsHighlighted(false), 1200)
    return () => window.clearTimeout(timer)
  }, [isHighlighted])

  const samplePrompt = t(
    "夕焼けの海辺で笑う女の子、やわらかい光、アニメ風",
    "a smiling girl on a beach at sunset, soft light, anime style",
  )

  const onSubmit = () => {
    const text = prompt.trim()

    // 空のときは例文を入れて、入力欄に戻す（押しても何も起きない、にしない）
    if (text === "") {
      setPrompt(samplePrompt)
      setHint(
        t(
          "例文を入れました。このまま「生成する」を押すか、好きな言葉に書きかえてください",
          "We added an example. Press Generate as is, or rewrite it in your own words",
        ),
      )
      setIsHighlighted(true)
      textareaRef.current?.focus()
      return
    }

    // ログインをはさんでも消えないように置いておく（詳細画面がこれを見て生成を始める）
    saveGenerationPendingPrompt(text)
    applyPrompt(text)

    if (!authContext.isLoggedIn) {
      setIsLoginOpen(true)
      return
    }

    props.onOpenAdvanced()
  }

  const onSelectExample = (example: GenerationSimpleEntryExample) => {
    setPrompt(example.prompt)
    setHint(
      t(
        "プロンプトを入れました。「生成する」を押すと作れます（英語のままで大丈夫です）",
        "Prompt added. Press Generate to create it",
      ),
    )
    setIsHighlighted(true)
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="mx-auto w-full max-w-5xl pt-2 pb-32 md:pt-4 md:pb-16">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={props.onOpenAdvanced}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
        >
          <SlidersHorizontalIcon className="size-3.5" />
          {t("詳細設定で開く", "Open advanced settings")}
        </button>
      </div>

      {/* ファーストビュー: キャッチ・入力欄・生成ボタン */}
      <section className="relative mt-1 overflow-hidden rounded-3xl border bg-linear-to-br from-fuchsia-50 via-background to-sky-50 px-4 py-8 sm:px-8 sm:py-12 dark:from-fuchsia-950/40 dark:via-background dark:to-sky-950/30">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/10 px-3 py-1 font-medium text-fuchsia-700 text-xs dark:text-fuchsia-300">
            <SparklesIcon className="size-3.5" />
            {t("はじめての方へ", "New here?")}
          </p>
          <h1 className="mt-3 text-balance font-bold text-2xl leading-tight tracking-tight sm:text-4xl">
            {t(
              "思い浮かべた絵を、文章にするだけ",
              "Just describe the picture in your mind",
            )}
          </h1>
          <p className="mt-3 text-balance text-muted-foreground text-sm sm:text-base">
            {t(
              "書いて「生成する」を押すだけで、AI がイラストにします。日本語でも大丈夫です。",
              "Write it down and press Generate. AI turns it into an illustration.",
            )}
          </p>
        </div>

        <div
          ref={formRef}
          className={cn(
            "mx-auto mt-6 max-w-2xl scroll-mt-24 rounded-2xl border bg-background p-3 shadow-sm transition-shadow focus-within:border-fuchsia-400/70 focus-within:shadow-md sm:p-4",
            isHighlighted && "border-fuchsia-400 ring-4 ring-fuchsia-400/30",
          )}
        >
          <textarea
            ref={textareaRef}
            aria-label={t("作りたい絵の説明", "Describe your picture")}
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value)
              setHint(null)
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.metaKey || event.ctrlKey) &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                onSubmit()
              }
            }}
            maxLength={20000}
            rows={4}
            placeholder={t(
              "例: 桜の下で笑う女の子、やわらかい光、アニメ風",
              "e.g. a smiling girl under cherry blossoms, soft light, anime style",
            )}
            className="block min-h-28 w-full resize-none border-0 bg-transparent p-1 text-base leading-7 outline-hidden placeholder:text-muted-foreground/70 sm:min-h-32"
          />
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p
              aria-live="polite"
              className={cn(
                "flex min-h-5 flex-1 items-start gap-1.5 text-left text-xs sm:text-sm",
                hint !== null
                  ? "text-fuchsia-700 dark:text-fuchsia-300"
                  : "text-muted-foreground",
              )}
            >
              {hint !== null && (
                <LightbulbIcon className="mt-0.5 size-4 shrink-0" />
              )}
              {hint ??
                t(
                  "モデルやサイズはおすすめの設定で作ります",
                  "We use the recommended model and size",
                )}
            </p>
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-tr from-fuchsia-600 to-fuchsia-500 px-8 font-bold text-base text-white shadow-fuchsia-500/30 shadow-lg transition hover:opacity-90 active:scale-[0.98] sm:w-auto dark:from-fuchsia-700 dark:to-fuchsia-600"
            >
              <SparklesIcon className="size-5" />
              {t("生成する", "Generate")}
            </button>
          </div>
        </div>

        <ul className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-x-4 gap-y-2 text-muted-foreground text-xs sm:text-sm">
          {[
            t(
              "ログインすると毎日10枚まで無料",
              "Up to 10 free images every day after login",
            ),
            t("日本語でOK", "Japanese is OK"),
            t("インストール不要", "No install needed"),
          ].map((text) => (
            <li key={text} className="inline-flex items-center gap-1">
              <CheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* 作例 */}
      <section className="mt-8 sm:mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2 px-1">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">
              {t("作例から選ぶ", "Start from an example")}
            </h2>
            <p className="mt-0.5 text-muted-foreground text-xs sm:text-sm">
              {t(
                "タップすると、そのプロンプトが入力欄に入ります",
                "Tap one to put its prompt in the box",
              )}
            </p>
          </div>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {GENERATION_SIMPLE_ENTRY_EXAMPLES.map((example) => {
            const isSelected = prompt === example.prompt
            return (
              <li key={example.workId}>
                <button
                  type="button"
                  onClick={() => onSelectExample(example)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative block aspect-3/4 w-full overflow-hidden rounded-2xl border bg-muted text-left shadow-sm transition hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-fuchsia-500",
                    isSelected &&
                      "ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-background",
                  )}
                >
                  <img
                    src={example.imageUrl}
                    alt={t(example.title, example.enTitle)}
                    width={example.width}
                    height={example.height}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-3 pt-8 pb-2.5">
                    <span className="block truncate font-bold text-sm text-white">
                      {t(example.title, example.enTitle)}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11px] text-white/80">
                      {isSelected ? (
                        <>
                          <CheckIcon className="size-3" />
                          {t("入力欄に入れました", "Added")}
                        </>
                      ) : (
                        <>
                          {t("このプロンプトを使う", "Use this prompt")}
                          <ArrowRightIcon className="size-3" />
                        </>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="mt-8 text-center text-muted-foreground text-xs sm:text-sm">
        {t(
          "モデルや枚数を細かく決めたい方は",
          "Want to choose the model and more?",
        )}{" "}
        <button
          type="button"
          onClick={props.onOpenAdvanced}
          className="font-medium text-fuchsia-700 underline-offset-4 hover:underline dark:text-fuchsia-300"
        >
          {t("詳細設定で開く", "Open advanced settings")}
        </button>
      </p>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ログイン", "Login")}</DialogTitle>
            <DialogDescription>
              {t(
                "ログイン（無料の登録）をすると、入力したプロンプトでそのまま生成が始まります。",
                "Log in (free sign-up) and generation starts right away with your prompt.",
              )}
            </DialogDescription>
          </DialogHeader>
          <LazyLoginDialogContent />
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * かんたん入口と詳細画面のどちらを出すか決めるまでの表示（詳細画面が一瞬出てしまわないように）
 */
export function GenerationEntrySkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-5xl pt-2 pb-16 md:pt-4"
      aria-busy="true"
    >
      <div className="flex justify-end">
        <Skeleton className="h-7 w-32 rounded-full" />
      </div>
      <Skeleton className="mt-1 h-80 w-full rounded-3xl sm:h-96" />
      <Skeleton className="mt-8 h-6 w-40" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: 並びが変わらない仮の表示
            key={index}
            className="aspect-3/4 w-full rounded-2xl"
          />
        ))}
      </div>
    </div>
  )
}
