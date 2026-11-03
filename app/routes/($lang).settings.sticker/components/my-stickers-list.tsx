import { useQuery } from "@apollo/client/index"
import { Link, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  DownloadIcon,
  ImageUpIcon,
  Loader2Icon,
  LockIcon,
  SearchIcon,
  StampIcon,
  StoreIcon,
  WandSparklesIcon,
} from "lucide-react"
import { lazy, Suspense, useContext, useEffect, useState } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { AddStickerDialog } from "~/routes/($lang)._main.posts.$post._index/components/add-sticker-dialog"
import {
  MyStickerDialog,
  MyStickerFragment,
  type MyStickerTab,
  toStickerTitle,
} from "~/routes/($lang).settings.sticker/components/my-sticker-dialog"
import { toResizedImageUrl } from "~/utils/resized-image-url"

// 作成ツールはとても大きいので、開いたときに読み込む
const StickerCreator = lazy(() =>
  import(
    "~/routes/($lang)._main.stickers._index/components/sticker-creator"
  ).then((module) => ({ default: module.StickerCreator })),
)

const PER_PAGE = 60

const TABS = [
  {
    param: "added",
    value: "DOWNLOADED",
    ja: "マイスタンプ",
    en: "My Stickers",
    hintJa:
      "広場から追加したスタンプです。標準の5種類は追加しなくても使えます。",
    hintEn:
      "Stickers you added from the Square. The 5 standard stickers are always available.",
  },
  {
    param: "private",
    value: "PRIVATE_CREATED",
    ja: "作成（非公開）",
    en: "Created (private)",
    hintJa: "自分だけが使えます。押すと見え方の確認や公開ができます。",
    hintEn: "Only you can use these. Tap one to preview or publish it.",
  },
  {
    param: "public",
    value: "PUBLIC_CREATED",
    ja: "作成（公開）",
    en: "Created (public)",
    hintJa: "広場に並んでいて、誰でも追加して使えます。",
    hintEn: "Listed in the Square. Anyone can add and use them.",
  },
] as const

/**
 * 設定のスタンプ一覧。タブ、検索、並び順、ページは URL に残す
 */
export function MyStickersList() {
  const authContext = useContext(AuthContext)
  const t = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)

  const isSkipped = authContext.isLoading || authContext.isNotLoggedIn

  const { data: countsData, refetch: refetchCounts } = useQuery(countsQuery, {
    skip: isSkipped,
    fetchPolicy: "cache-and-network",
  })

  const counts = countsData?.viewer

  const countOf = (tab: MyStickerTab) => {
    if (counts === undefined || counts === null) return null
    if (tab === "DOWNLOADED") return counts.downloadedCount
    if (tab === "PRIVATE_CREATED") return counts.privateCount
    return counts.publicCount
  }

  const toDefaultTab = (): MyStickerTab => {
    // 追加したスタンプがなければ、中身のあるタブを最初に見せる
    if (countOf("DOWNLOADED") !== 0) return "DOWNLOADED"
    if ((countOf("PRIVATE_CREATED") ?? 0) > 0) return "PRIVATE_CREATED"
    if ((countOf("PUBLIC_CREATED") ?? 0) > 0) return "PUBLIC_CREATED"
    return "DOWNLOADED"
  }

  const tab =
    TABS.find((item) => item.param === searchParams.get("tab"))?.value ??
    toDefaultTab()
  const currentTab = TABS.find((item) => item.value === tab) ?? TABS[0]

  const search = searchParams.get("q") ?? ""
  const sort = searchParams.get("sort") === "used" ? "used" : "added"
  const page = Math.max(
    Number.parseInt(searchParams.get("page") ?? "0") || 0,
    0,
  )

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    // ページ以外を変えたら最初のページに戻す
    next.delete("page")
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }

  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    if (searchInput === search) return
    const timer = setTimeout(() => {
      updateParams({ q: searchInput === "" ? null : searchInput })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const {
    data: currentData,
    previousData,
    loading,
    refetch: refetchList,
  } = useQuery(stickersQuery, {
    skip: isSkipped,
    fetchPolicy: "cache-and-network",
    variables: {
      limit: PER_PAGE,
      offset: page * PER_PAGE,
      // DATE_CREATED は標準スタンプが先頭に混ざるので使わない
      orderBy: sort === "used" ? "DATE_USED" : "DATE_DOWNLOADED",
      where: {
        savedTypes: [tab],
        ...(search !== "" && { search }),
      },
    },
  })

  const data = currentData ?? previousData
  const stickers = data?.viewer?.userStickers
  const totalCount = data?.viewer?.userStickersCount ?? 0
  const selected = stickers?.find((sticker) => sticker.id === selectedId)

  const refetch = () => {
    void refetchList()
    void refetchCounts()
  }

  // 最後のページの最後の1枚を消したら、前のページに戻す
  useEffect(() => {
    if (page > 0 && stickers?.length === 0 && currentData !== undefined) {
      updateParams({})
    }
  }, [page, stickers?.length, currentData])

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button
          className="h-10 gap-1.5 rounded-full"
          aria-expanded={isCreatorOpen}
          onClick={() => setIsCreatorOpen((value) => !value)}
        >
          <WandSparklesIcon className="size-4" />
          {t("ツールで作る", "Make with tool")}
        </Button>
        <AddStickerDialog
          onAddedSicker={(isPublic) => {
            refetch()
            updateParams({
              tab: isPublic ? "public" : "private",
              q: null,
              sort: null,
            })
          }}
        >
          <Button variant="secondary" className="h-10 gap-1.5 rounded-full">
            <ImageUpIcon className="size-4" />
            {t("画像から作る", "From an image")}
          </Button>
        </AddStickerDialog>
        <Button
          variant="ghost"
          className="col-span-2 h-10 gap-1.5 rounded-full sm:ml-auto"
          asChild
        >
          <Link to="/stickers">
            <StoreIcon className="size-4" />
            {t("スタンプ広場でさがす", "Browse the Sticker Square")}
          </Link>
        </Button>
      </div>

      {isCreatorOpen && (
        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center rounded-xl border">
              <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <StickerCreator
            onClose={() => {
              setIsCreatorOpen(false)
              refetch()
            }}
          />
        </Suspense>
      )}

      <div
        role="tablist"
        aria-label={t("スタンプの種類", "Sticker type")}
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
      >
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => updateParams({ tab: item.param })}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 font-medium text-sm transition-colors",
              tab === item.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {t(item.ja, item.en)}
            <span className="text-xs tabular-nums opacity-70">
              {countOf(item.value)?.toLocaleString() ?? "-"}
            </span>
          </button>
        ))}
      </div>

      <p className="text-muted-foreground text-xs leading-5">
        {t(currentTab.hintJa, currentTab.hintEn)}
      </p>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("タイトルで検索", "Search by title")}
            aria-label={t("タイトルで検索", "Search by title")}
            className="h-10 pl-9"
          />
        </div>
        <Select
          value={sort}
          onValueChange={(value) =>
            updateParams({ sort: value === "used" ? "used" : null })
          }
        >
          <SelectTrigger
            className="h-10 w-36 shrink-0"
            aria-label={t("並び順", "Sort")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="added">
              {t("追加が新しい順", "Recently added")}
            </SelectItem>
            <SelectItem value="used">
              {t("最近使った順", "Recently used")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {stickers === undefined && (
        <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 10 }, (_, index) => index).map((index) => (
            <Skeleton key={index} className="aspect-square rounded-2xl" />
          ))}
        </div>
      )}

      {stickers !== undefined && stickers.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <StampIcon className="size-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            {search !== ""
              ? t(
                  `「${search}」に合うスタンプはありません`,
                  `No stickers match "${search}"`,
                )
              : tab === "DOWNLOADED"
                ? t(
                    "まだ追加したスタンプはありません",
                    "You have not added any stickers yet",
                  )
                : t(
                    "このタブのスタンプはまだありません",
                    "No stickers here yet",
                  )}
          </p>
          {search === "" && tab === "DOWNLOADED" && (
            <Button variant="secondary" className="rounded-full" asChild>
              <Link to="/stickers">
                {t("スタンプ広場を見る", "Browse the Sticker Square")}
              </Link>
            </Button>
          )}
        </div>
      )}

      {stickers !== undefined && stickers.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-3 gap-x-2 gap-y-4 transition-opacity sm:grid-cols-4 md:grid-cols-5",
            loading && currentData === undefined && "opacity-60",
          )}
        >
          {stickers.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => setSelectedId(sticker.id)}
              className="group min-w-0 text-left"
            >
              <div className="relative overflow-hidden rounded-2xl bg-muted/60 transition group-hover:bg-muted">
                <img
                  className="aspect-square w-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-105"
                  src={toResizedImageUrl(sticker.imageUrl, 240) ?? ""}
                  alt={toStickerTitle(sticker.title)}
                  width={240}
                  height={240}
                  loading="lazy"
                  decoding="async"
                />
                {tab === "PRIVATE_CREATED" && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-background/90 p-1">
                    <LockIcon className="size-3" />
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "mt-1.5 truncate font-medium text-sm",
                  toStickerTitle(sticker.title) === "" &&
                    "text-muted-foreground",
                )}
              >
                {toStickerTitle(sticker.title) || t("タイトルなし", "Untitled")}
              </p>
              {tab !== "PRIVATE_CREATED" && (
                <p className="flex items-center gap-2.5 text-muted-foreground text-xs tabular-nums">
                  <span
                    className="flex items-center gap-0.5"
                    title={t("追加された数", "Added")}
                  >
                    <DownloadIcon className="size-3" />
                    {sticker.downloadsCount}
                  </span>
                  <span
                    className="flex items-center gap-0.5"
                    title={t("使われた数", "Used")}
                  >
                    <StampIcon className="size-3" />
                    {sticker.usesCount}
                  </span>
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <ResponsivePagination
        perPage={PER_PAGE}
        maxCount={totalCount}
        currentPage={page}
        maxPages={Math.ceil(totalCount / PER_PAGE)}
        onPageChange={(nextPage) => {
          const next = new URLSearchParams(searchParams)
          if (nextPage === 0) {
            next.delete("page")
          } else {
            next.set("page", nextPage.toString())
          }
          setSearchParams(next, { preventScrollReset: true })
        }}
      />

      {selected !== undefined && (
        <MyStickerDialog
          key={selected.id}
          sticker={selected}
          tab={tab}
          onClose={() => setSelectedId(null)}
          onChanged={refetch}
        />
      )}
    </div>
  )
}

const countsQuery = graphql(
  `query ViewerMyStickerCounts {
    viewer {
      id
      downloadedCount: userStickersCount(where: { savedTypes: [DOWNLOADED] })
      privateCount: userStickersCount(where: { savedTypes: [PRIVATE_CREATED] })
      publicCount: userStickersCount(where: { savedTypes: [PUBLIC_CREATED] })
    }
  }`,
)

const stickersQuery = graphql(
  `query ViewerMyStickers($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy, $where: UserStickersWhereInput) {
    viewer {
      id
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy, where: $where) {
        ...MySticker
      }
      userStickersCount(where: $where)
    }
  }`,
  [MyStickerFragment],
)
