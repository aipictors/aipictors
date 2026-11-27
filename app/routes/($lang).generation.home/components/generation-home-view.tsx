import { useApolloClient } from "@apollo/client/index"
import { graphql, type ResultOf } from "gql.tada"
import {
  ExternalLinkIcon,
  HeartIcon,
  Loader2Icon,
  PencilIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { useHydrated } from "remix-utils/use-hydrated"
import { LazyLoginDialogContent } from "~/components/lazy-login-dialog-content"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import { useApplyGenerationEntryPrompt } from "~/routes/($lang).generation._index/hooks/use-generation-auto-submit"
import {
  readGenerationPendingPrompt,
  saveGenerationPendingPrompt,
  savePrefersAdvancedEntry,
} from "~/routes/($lang).generation._index/utils/generation-simple-entry"
import { GENERATION_SIMPLE_ENTRY_EXAMPLES } from "~/routes/($lang).generation._index/utils/generation-simple-entry-examples"
import {
  GENERATION_HOME_MAX_PAGES,
  GENERATION_HOME_PAGE_SIZE,
  GENERATION_HOME_TAGS,
  type GenerationHomeFilter,
  toGenerationHomeWorksWhere,
} from "~/routes/($lang).generation.home/utils/home-works-where"
import { toHomeExamplePrompt } from "~/routes/($lang).generation.home/utils/to-home-example-prompt"
import {
  toResizedImageSrcSet,
  toResizedImageUrl,
} from "~/utils/resized-image-url"
import { toIconImageUrl } from "~/utils/with-icon-url-fallback"

export const GenerationHomeWorkFragment = graphql(
  `fragment GenerationHomeWork on WorkNode @_unmask {
    id
    title
    prompt
    likesCount
    largeThumbnailImageURL
    largeThumbnailImageWidth
    largeThumbnailImageHeight
    user {
      id
      name
      iconUrl
    }
  }`,
)

export const GenerationHomeWorksQuery = graphql(
  `query GenerationHomeWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...GenerationHomeWork
    }
  }`,
  [GenerationHomeWorkFragment],
)

type HomeWork = ResultOf<typeof GenerationHomeWorkFragment>

type Props = {
  /**
   * 人気の作例（サーバーで読んだもの）
   */
  initialWorks: HomeWork[]
}

/**
 * 作品が読めなかったときに出す、運営が選んだ作例
 */
const fallbackWorks: HomeWork[] = GENERATION_SIMPLE_ENTRY_EXAMPLES.map(
  (example) => ({
    id: example.workId,
    title: example.title,
    prompt: example.prompt,
    likesCount: 0,
    largeThumbnailImageURL: example.imageUrl,
    largeThumbnailImageWidth: example.width,
    largeThumbnailImageHeight: example.height,
    user: null,
  }),
)

const isSameFilter = (a: GenerationHomeFilter, b: GenerationHomeFilter) => {
  if (a.kind !== b.kind) return false
  if (a.kind === "tag" && b.kind === "tag") return a.tag === b.tag
  return true
}

/**
 * 画像生成のトップ（PixAI のトップのような、入力欄＋生成ボタン＋作例の一覧）
 * - 書いて「生成する」を押すと /generation に移って、そのプロンプトで生成を始める（未ログインならログインのあと）
 * - 作例を押すと、その作品の公開プロンプトが入力欄に入る
 */
export function GenerationHomeView(props: Props) {
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const navigate = useNavigate()

  const apolloClient = useApolloClient()

  const applyPrompt = useApplyGenerationEntryPrompt()

  // 作例の作者アイコンは hydration の後に読む（下の img の src）
  const isHydrated = useHydrated()

  // ログインを途中でやめて戻ってきたときも、書いた内容を残す
  const [prompt, setPrompt] = useState(
    () => readGenerationPendingPrompt()?.prompt ?? "",
  )

  const [hint, setHint] = useState<string | null>(null)

  const [isHighlighted, setIsHighlighted] = useState(false)

  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // 生成するを押してログインを待っている（閉じても、あとでログインしたら生成画面へ）
  const [isWaitingLogin, setIsWaitingLogin] = useState(false)

  const [filter, setFilter] = useState<GenerationHomeFilter>({
    kind: "popular",
  })

  const [works, setWorks] = useState<HomeWork[]>(
    props.initialWorks.length > 0 ? props.initialWorks : fallbackWorks,
  )

  const [pageCount, setPageCount] = useState(1)

  const [hasMore, setHasMore] = useState(
    props.initialWorks.length >= GENERATION_HOME_PAGE_SIZE,
  )

  const [isLoadingWorks, setIsLoadingWorks] = useState(false)

  const requestIdRef = useRef(0)

  const formRef = useRef<HTMLDivElement>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isHighlighted) return
    const timer = window.setTimeout(() => setIsHighlighted(false), 1200)
    return () => window.clearTimeout(timer)
  }, [isHighlighted])

  // ログインが済んだら生成画面へ（生成画面が置いておいたプロンプトで生成を始める）
  useEffect(() => {
    if (!isWaitingLogin || !authContext.isLoggedIn) return
    setIsLoginOpen(false)
    navigate("/generation")
  }, [isWaitingLogin, authContext.isLoggedIn])

  const loadWorks = async (
    nextFilter: GenerationHomeFilter,
    page: number,
  ): Promise<void> => {
    const requestId = ++requestIdRef.current
    setIsLoadingWorks(true)
    try {
      const result = await apolloClient.query({
        query: GenerationHomeWorksQuery,
        variables: {
          offset: (page - 1) * GENERATION_HOME_PAGE_SIZE,
          limit: GENERATION_HOME_PAGE_SIZE,
          where: toGenerationHomeWorksWhere(nextFilter, new Date()),
        },
        fetchPolicy: "cache-first",
      })
      if (requestId !== requestIdRef.current) return
      const loaded = result.data.works
      setWorks((current) => {
        if (page === 1) return loaded
        const ids = new Set(current.map((work) => work.id))
        return [...current, ...loaded.filter((work) => !ids.has(work.id))]
      })
      setPageCount(page)
      setHasMore(loaded.length >= GENERATION_HOME_PAGE_SIZE)
    } catch {
      if (requestId !== requestIdRef.current) return
      if (page === 1) setWorks([])
      setHasMore(false)
    } finally {
      if (requestId === requestIdRef.current) setIsLoadingWorks(false)
    }
  }

  const onSelectFilter = (nextFilter: GenerationHomeFilter) => {
    if (isSameFilter(nextFilter, filter)) return
    setFilter(nextFilter)
    if (
      nextFilter.kind === "popular" &&
      props.initialWorks.length > 0 &&
      !isLoadingWorks
    ) {
      requestIdRef.current++
      setWorks(props.initialWorks)
      setPageCount(1)
      setHasMore(props.initialWorks.length >= GENERATION_HOME_PAGE_SIZE)
      return
    }
    setWorks([])
    void loadWorks(nextFilter, 1)
  }

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

    // ログインをはさんでも消えないように置いておく（生成画面がこれを見て生成を始める）
    saveGenerationPendingPrompt(text)
    applyPrompt(text)

    if (!authContext.isLoggedIn) {
      setIsWaitingLogin(true)
      setIsLoginOpen(true)
      return
    }

    navigate("/generation")
  }

  const onOpenAdvanced = () => {
    savePrefersAdvancedEntry()
    navigate("/generation?mode=advanced")
  }

  const onSelectWork = (work: HomeWork) => {
    const text = toHomeExamplePrompt(work.prompt ?? "")
    if (text === "") return
    setPrompt(text)
    setHint(
      t(
        "この作品のプロンプトを入れました。「生成する」を押すと作れます（書きかえてもOK）",
        "Added this work's prompt. Press Generate to create it (feel free to edit)",
      ),
    )
    setIsHighlighted(true)
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const filters: { filter: GenerationHomeFilter; label: string }[] = [
    { filter: { kind: "popular" }, label: t("人気", "Popular") },
    { filter: { kind: "latest" }, label: t("新着", "Latest") },
    ...GENERATION_HOME_TAGS.map((item) => ({
      filter: { kind: "tag" as const, tag: item.tag },
      label: t(item.tag, item.enLabel),
    })),
  ]

  return (
    <div className="mx-auto w-full max-w-[1600px] pt-3 pb-28 md:pt-6 md:pb-16">
      {/* 入力欄と生成ボタン */}
      <section className="mx-auto max-w-2xl">
        <h1 className="text-center font-bold text-xl tracking-tight sm:text-2xl">
          {t(
            "思い浮かべた絵を、文章にするだけ",
            "Just describe the picture in your mind",
          )}
        </h1>
        <div
          ref={formRef}
          className={cn(
            "mt-4 scroll-mt-24 rounded-2xl border bg-background p-3 shadow-sm transition-shadow focus-within:border-primary/60 focus-within:shadow-md sm:p-4",
            isHighlighted && "border-primary ring-4 ring-primary/20",
          )}
        >
          <div className="flex gap-2">
            <PencilIcon className="mt-1.5 size-4 shrink-0 text-muted-foreground" />
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
              rows={3}
              placeholder={t(
                "例: 桜の下で笑う女の子、やわらかい光、アニメ風（日本語でOK）",
                "e.g. a smiling girl under cherry blossoms, soft light, anime style",
              )}
              className="block min-h-20 w-full resize-none border-0 bg-transparent p-0.5 text-base leading-7 outline-hidden placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <p
              aria-live="polite"
              className={cn(
                "min-h-5 flex-1 text-left text-xs",
                hint !== null ? "text-primary" : "text-muted-foreground",
              )}
            >
              {hint ??
                t(
                  "モデルやサイズはおすすめの設定で作ります",
                  "We use the recommended model and size",
                )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAdvanced}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
              >
                <SlidersHorizontalIcon className="size-3.5" />
                {t("詳細設定", "Advanced")}
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-7 font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:flex-none"
              >
                <SparklesIcon className="size-4" />
                {t("生成する", "Generate")}
              </button>
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-muted-foreground text-xs">
          {t(
            "ログインすると毎日10枚まで無料・インストール不要",
            "Up to 10 free images every day after login · No install needed",
          )}
        </p>
      </section>

      {/* 絞り込み */}
      <div className="-mx-4 mt-8 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-2">
          {filters.map((item) => {
            const isActive = isSameFilter(item.filter, filter)
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectFilter(item.filter)}
                aria-pressed={isActive}
                className={cn(
                  "h-8 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted",
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-2 text-muted-foreground text-xs">
        {t(
          "Aipictors で作られた作品です。押すとそのプロンプトが入力欄に入ります",
          "Made on Aipictors. Tap one to use its prompt",
        )}
      </p>

      {/* 作例（高さの違う画像を詰めて並べる） */}
      <ul className="mt-3 columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5">
        {works.map((work, index) => (
          <li key={work.id} className="mb-3 break-inside-avoid">
            <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
              <button
                type="button"
                onClick={() => onSelectWork(work)}
                className="group relative block w-full overflow-hidden bg-muted text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                <img
                  src={toResizedImageUrl(work.largeThumbnailImageURL, 480)}
                  srcSet={toResizedImageSrcSet(work.largeThumbnailImageURL, {
                    minWidth: 240,
                    maxWidth: work.largeThumbnailImageWidth,
                  })}
                  // 2〜5 列の段組み
                  sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  alt={work.title}
                  width={work.largeThumbnailImageWidth}
                  height={work.largeThumbnailImageHeight}
                  // 最初に見える数枚は待たずに読む（一番大きく見える絵なので遅延させない）。
                  // 段組みは上から順に詰めるので、スマホ（2 列）の右の列の先頭は半分あたりの絵
                  loading={
                    index < 6 ||
                    Math.abs(index - Math.floor(works.length / 2)) <= 1
                      ? "eager"
                      : "lazy"
                  }
                  // スマホで最初に見える左右の列の先頭を優先して読む。右の列の先頭（半分あたり）が
                  // 一番大きい絵（LCP）になることが多く、JS の読み込みも fetchpriority="high" の画像を待つ（defer-hydration.ts）
                  fetchPriority={
                    index === 0 ||
                    Math.abs(index - Math.floor(works.length / 2)) <= 1
                      ? "high"
                      : undefined
                  }
                  decoding="async"
                  className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-linear-to-t from-black/70 to-transparent px-2.5 pt-8 pb-2 font-medium text-white text-xs opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <SparklesIcon className="size-3.5" />
                  {t("このプロンプトを使う", "Use this prompt")}
                </span>
              </button>
              <div className="flex items-center gap-2 px-2.5 py-2">
                {work.user ? (
                  <>
                    <img
                      // 動くアイコンは縮小されず元の画像（数百 KB〜1.5MB）が届くので、最初の HTML には入れず
                      // hydration の後（JS は優先して読む作例の画像を待ってから動く。defer-hydration.ts）に読む。
                      // 入れておくと 20px のアイコンが一番大きい絵（LCP）と回線を取り合う。読むまでは bg-muted の丸
                      src={
                        isHydrated
                          ? toIconImageUrl(work.user.iconUrl)
                          : undefined
                      }
                      alt=""
                      width={20}
                      height={20}
                      loading="lazy"
                      fetchPriority="low"
                      className="size-5 shrink-0 rounded-full bg-muted object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
                      {work.user.name}
                    </span>
                  </>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
                    {work.title}
                  </span>
                )}
                {work.likesCount > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-muted-foreground text-xs">
                    <HeartIcon className="size-3" />
                    {work.likesCount.toLocaleString()}
                  </span>
                )}
                <Link
                  to={`/posts/${work.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("作品を見る", "View work")}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLinkIcon className="size-3.5" />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {isLoadingWorks && (
        <div className="flex justify-center py-8">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoadingWorks && works.length === 0 && (
        <p className="py-12 text-center text-muted-foreground text-sm">
          {t("作品が見つかりませんでした", "No works found")}
        </p>
      )}

      {!isLoadingWorks && hasMore && pageCount < GENERATION_HOME_MAX_PAGES && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => void loadWorks(filter, pageCount + 1)}
            className="h-10 rounded-full border px-6 text-sm transition-colors hover:bg-muted"
          >
            {t("もっと見る", "Show more")}
          </button>
        </div>
      )}

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
