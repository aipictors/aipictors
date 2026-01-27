import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, redirect } from "@remix-run/cloudflare"
import { useLoaderData, Link } from "@remix-run/react"
import { useState, useCallback, useMemo } from "react"
import {
  Eye,
  MessageCircle,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react"
import { OptimizedImage } from "~/components/optimized-image"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"
import { useTranslation } from "~/hooks/use-translation"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"
import { loaderClient } from "~/lib/loader-client"
import { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { type FragmentOf, graphql } from "gql.tada"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useQuery } from "@apollo/client/index"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { MasonryWorkGrid } from "~/components/masonry-work-grid"
import { LikeButton } from "~/components/like-button"
import { FollowButton } from "~/components/button/follow-button"
import { CopyWorkUrlButton } from "~/routes/($lang)._main.posts.$post._index/components/work-action-copy-url"
import { XIntent } from "~/routes/($lang)._main.posts.$post._index/components/work-action-share-x"
import { downloadImageFileAsPng } from "~/routes/($lang).generation._index/utils/download-image-file-as-png"
import { GalleryHeader } from "~/components/gallery-header"
import { GalleryTagList } from "~/components/tag/gallery-tag"

export function HydrateFallback() {
  return <AppLoadingPage />
}

export async function loader(props: LoaderFunctionArgs) {
  const redirectResponse = checkLocaleRedirect(props.request)
  if (redirectResponse) {
    return redirectResponse
  }

  // クエリパラメータをチェック（検索機能優先）
  const url = new URL(props.request.url)
  const searchQuery = url.searchParams.get("q")

  // 検索クエリがある場合はギャラリー一覧ページにリダイレクト
  if (searchQuery) {
    const redirectUrl = new URL("/posts/gallery", url.origin)
    redirectUrl.searchParams.set("q", searchQuery)
    // 他のクエリパラメータも保持
    for (const [key, value] of url.searchParams) {
      if (key !== "q") {
        redirectUrl.searchParams.set(key, value)
      }
    }
    return redirect(redirectUrl.toString())
  }

  const workId = props.params.workId
  if (!workId) {
    throw new Response("Work not found", { status: 404 })
  }

  const workResp = await loaderClient.query({
    query: workQuery,
    variables: {
      id: workId,
    },
  })

  if (workResp.data.work === null) {
    throw new Response(null, { status: 404 })
  }

  // 非公開の場合はエラー
  if (
    workResp.data.work.accessType === "PRIVATE" ||
    workResp.data.work.accessType === "DRAFT"
  ) {
    throw new Response(null, { status: 404 })
  }

  // センシティブな作品の場合は/r/にリダイレクト
  if (
    workResp.data.work.rating === "R18" ||
    workResp.data.work.rating === "R18G"
  ) {
    return redirect(`/r/posts/${workId}`)
  }

  // 関連作品を取得（主要なタグのみ使用）
  const mainTags = workResp.data.work.tagNames?.slice(0, 2) || []

  const relatedWorksResp =
    mainTags.length > 0
      ? await loaderClient.query({
          query: relatedWorksQuery,
          variables: {
            offset: 0,
            limit: 32, // 初期ページ分
            where: {
              tagNames: [
                ...mainTags,
                ...mainTags.map((tag) => decodeURIComponent(tag).toLowerCase()),
                ...mainTags.map((tag) => decodeURIComponent(tag).toUpperCase()),
                ...mainTags.map((tag) =>
                  decodeURIComponent(tag).replace(/[\u30A1-\u30F6]/g, (m) =>
                    String.fromCharCode(m.charCodeAt(0) - 96),
                  ),
                ),
                ...mainTags.map((tag) =>
                  decodeURIComponent(tag).replace(/[\u3041-\u3096]/g, (m) =>
                    String.fromCharCode(m.charCodeAt(0) + 96),
                  ),
                ),
              ],
              ratings: ["G", "R15"],
              orderBy: "LIKES_COUNT",
              sort: "DESC",
              isNowCreatedAt: true, // 最新の作品を優先
            },
          },
        })
      : { data: { tagWorks: [] } }

  const relatedWorks =
    relatedWorksResp.data.tagWorks?.filter((work) => work.id !== workId) || []

  // デバッグログ：関連作品の詳細
  console.log("Loader - Related Works Debug:", {
    mainTags,
    originalWorksCount: relatedWorksResp.data.tagWorks?.length || 0,
    filteredWorksCount: relatedWorks.length,
    sampleWorks: relatedWorks.slice(0, 3).map((work) => ({
      id: work.id,
      title: work.title,
      // tagNamesがあれば出力
      ...(work.tagNames && { tagNames: work.tagNames }),
    })),
  })

  return json({
    workId,
    work: workResp.data.work,
    relatedWorks,
    mainTags,
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "status" in data || !data.work) {
    return [{ title: "作品が見つかりません" }]
  }

  const work = data.work

  return createMeta(META.POSTS, {
    title: work.title,
    description: work.description ?? "",
    image: work.largeThumbnailImageURL,
  })
}

/**
 * ギャラリーの作品詳細ページ
 */
export default function GalleryWorkPage() {
  const data = useLoaderData<typeof loader>()

  // リダイレクトレスポンスの場合は何も表示しない
  if ("status" in data) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ヘッダー */}
      <GalleryHeader />

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <WorkDetailContent work={data.work} data={data} />
      </div>
    </div>
  )
}

/**
 * 作品詳細コンテンツ
 */
function WorkDetailContent(props: {
  work: FragmentOf<typeof workArticleFragment>
  data: {
    workId: string
    work: FragmentOf<typeof workArticleFragment>
    relatedWorks: Array<{
      id: string
      title: string
      largeThumbnailImageURL: string
      largeThumbnailImageWidth: number
      largeThumbnailImageHeight: number
      smallThumbnailImageURL: string
      smallThumbnailImageWidth: number
      smallThumbnailImageHeight: number
      likesCount: number
      viewsCount: number
      user: {
        id: string
        name: string
        login: string
        iconUrl?: string | null
      } | null
    }>
    mainTags: string[]
  }
}) {
  const { work, data } = props

  // ダウンロード機能
  const onDownload = async () => {
    if (!work.largeThumbnailImageURL) return
    await downloadImageFileAsPng(work.id, work.largeThumbnailImageURL)
  }

  return (
    <>
      {/* Pinterest風レイアウト */}
      <div className="mx-auto max-w-7xl">
        {/* PC時: 横並び、モバイル時: 縦並び */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* 左側: メイン画像 */}
          <div className="flex-1 lg:max-w-2xl">
            <div className="sticky top-24">
              <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-card">
                <div className="relative">
                  <OptimizedImage
                    src={work.largeThumbnailImageURL}
                    alt={work.title}
                    width={work.largeThumbnailImageWidth}
                    height={work.largeThumbnailImageHeight}
                    className="w-full object-cover"
                    loading="eager"
                  />

                  {/* 画像上のアクションボタン */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-md bg-white/90 hover:bg-white">
                      <LikeButton
                        size={36}
                        targetWorkId={work.id}
                        targetWorkOwnerUserId={work.user?.id ?? ""}
                        defaultLiked={work.isLiked}
                        defaultLikedCount={work.likesCount}
                        isBackgroundNone={true}
                        strokeWidth={2}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="size-9 bg-white/90 p-0 hover:bg-white"
                      onClick={onDownload}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="size-9 bg-white/90 p-0 hover:bg-white"
                        >
                          <Share2 className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">
                              作品を共有する
                            </h4>
                          </div>
                          <div className="grid gap-2">
                            <CopyWorkUrlButton
                              currentUrl={`https://www.aipictors.com/posts/${work.id}`}
                            />
                            <XIntent
                              text={`AIイラスト投稿サイトAipictorsに投稿された作品\n「${work.title}」\n\n${work.description ?? ""}`}
                              url={`https://www.aipictors.com/posts/${work.id}`}
                              hashtags={["Aipictors", "AIイラスト"]}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: 詳細情報 */}
          <div className="flex-1 lg:max-w-md">
            <WorkDetailsPanel work={work} />
          </div>
        </div>

        {/* サブ画像がある場合 */}
        {work.subWorks && work.subWorks.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {work.subWorks.map((subWork) => (
              <div
                key={subWork.id}
                className="overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-card"
              >
                <OptimizedImage
                  src={subWork.imageUrl || ""}
                  alt={`${work.title} - ${subWork.id}`}
                  width={400}
                  height={400}
                  className="w-full object-cover transition-transform duration-200 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 関連作品セクション */}
      <RelatedWorksSection
        workId={work.id}
        tagNames={data.mainTags}
        initialWorks={
          data.relatedWorks as unknown as FragmentOf<
            typeof PhotoAlbumWorkFragment
          >[]
        }
      />
    </>
  )
}

const workQuery = graphql(
  `query Work($id: ID!) {
    work(id: $id) {
      ...WorkArticle
    }
  }`,
  [workArticleFragment],
)

const relatedWorksQuery = graphql(
  `query RelatedWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    tagWorks(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

/**
 * 関連作品セクション
 */
function RelatedWorksSection(props: {
  workId: string
  tagNames: string[]
  initialWorks: Array<FragmentOf<typeof PhotoAlbumWorkFragment>>
}) {
  const { workId, tagNames, initialWorks } = props
  const t = useTranslation()
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // フィルター条件を構築
  const where = useMemo(
    () => ({
      tagNames:
        tagNames.length > 0
          ? [
              ...tagNames,
              ...tagNames.map((tag) => decodeURIComponent(tag).toLowerCase()),
              ...tagNames.map((tag) => decodeURIComponent(tag).toUpperCase()),
              ...tagNames.map((tag) =>
                decodeURIComponent(tag).replace(/[\u30A1-\u30F6]/g, (m) =>
                  String.fromCharCode(m.charCodeAt(0) - 96),
                ),
              ),
              ...tagNames.map((tag) =>
                decodeURIComponent(tag).replace(/[\u3041-\u3096]/g, (m) =>
                  String.fromCharCode(m.charCodeAt(0) + 96),
                ),
              ),
            ]
          : [],
      ratings: ["G", "R15"] as ("G" | "R15" | "R18" | "R18G")[],
      orderBy: "LIKES_COUNT" as const,
      sort: "DESC" as const,
      isNowCreatedAt: true, // 最新の作品を優先
    }),
    [tagNames],
  )

  // デバッグログ
  console.log("RelatedWorksSection:", {
    workId,
    tagNames,
    initialWorksLength: initialWorks.length,
    initialWorks: initialWorks.slice(0, 3), // 最初の3件のみログ出力
    where, // フィルター条件も出力
  })

  const PER_PAGE = 32

  // 無限スクロール用のGraphQLクエリ
  const { fetchMore } = useQuery(relatedWorksQuery, {
    variables: {
      offset: 0,
      limit: PER_PAGE,
      where,
    },
    skip: true, // 初期データは既にあるのでスキップ
  })

  // ページ管理
  const storeKey = useMemo(
    () => `related-works-${workId}-${tagNames.join("-")}`,
    [workId, tagNames],
  )

  const { pages, appendPage, flat } = usePagedInfinite(
    initialWorks.length > 0 ? [initialWorks] : [],
    storeKey,
  )

  // hasNextの計算
  const hasNext = (pages.at(-1)?.length ?? 0) >= PER_PAGE - 8

  const loadMore = useCallback(async () => {
    if (!hasNext || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          offset: flat.length,
          limit: PER_PAGE,
          where,
        },
      })
      if (result.data?.tagWorks?.length) {
        // 現在の作品を除外
        const filteredWorks = result.data.tagWorks.filter(
          (work) => work.id !== workId,
        )
        if (filteredWorks.length > 0) {
          appendPage(filteredWorks)
        }
      }
    } catch (error) {
      console.error("Failed to load more related works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    hasNext,
    isLoadingMore,
    fetchMore,
    flat.length,
    where,
    workId,
    appendPage,
  ])

  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: isLoadingMore,
  })

  const works = flat

  // デバッグログ：最終的な works の確認
  console.log("RelatedWorksSection - final works:", {
    worksLength: works.length,
    hasNext,
    isLoadingMore,
    works: works.slice(0, 3), // 最初の3件のみログ出力
  })

  if (!tagNames.length || works.length === 0) return null

  return (
    <div className="mt-16 space-y-8">
      <div className="text-center">
        <h2 className="font-bold text-2xl text-foreground">
          {t("関連する作品", "Related Works")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {tagNames.map((tag) => `#${tag}`).join(" ")} {t("の作品", "works")}
        </p>
      </div>

      {/* 関連作品グリッド */}
      <MasonryWorkGrid
        works={works}
        isLoadingMore={isLoadingMore}
        baseUrl="posts/gallery"
      />

      {/* 無限スクロール用のセンチネル */}
      {hasNext && (
        <div
          ref={sentinelRef}
          className="h-1 w-full"
          style={{ marginTop: "24px" }}
        />
      )}

      {/* ローディング表示 */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
            <span className="text-muted-foreground text-sm">
              {t("作品を読み込み中...", "Loading more artworks...")}
            </span>
          </div>
        </div>
      )}

      {/* 終了メッセージ */}
      {!hasNext && works.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">
            {t("すべての関連作品を表示しました", "All related works loaded")}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 作品詳細パネル（右側）
 */
function WorkDetailsPanel(props: {
  work: FragmentOf<typeof workArticleFragment>
}) {
  const { work } = props
  const t = useTranslation()
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)

  // テキストの長さによって展開ボタンを表示するかどうかを決定
  const shouldShowDescriptionExpand = (work.description?.length || 0) > 150
  const shouldShowPromptExpand = (work.prompt?.length || 0) > 200

  // クリップボードにコピーする関数
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: トースト通知を追加
      console.log(`${type}をコピーしました`)
    } catch (err) {
      console.error("コピーに失敗しました:", err)
    }
  }

  return (
    <div className="space-y-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-card">
      {/* タイトルとユーザー情報 */}
      <div className="space-y-4">
        <h1 className="font-bold text-2xl text-foreground lg:text-3xl">
          {work.title}
        </h1>

        {work.user && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage
                  src={withIconUrlFallback(work.user.iconUrl)}
                  alt={work.user.name}
                />
                <AvatarFallback>{work.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/posts/gallery/users/${work.user.login}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {work.user.name}
                </Link>
                <p className="text-muted-foreground text-sm">
                  @{work.user.login}
                </p>
              </div>
            </div>

            <FollowButton
              targetUserId={work.user.id}
              isFollow={work.user.isFollowee}
              className="!w-auto flex h-10 items-center justify-center rounded-full px-6 py-2 font-medium transition-all duration-200 hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="flex items-center gap-6 text-muted-foreground text-sm">
        <div className="flex items-center gap-1">
          <Eye className="size-4" />
          <span>
            {work.viewsCount} {t("閲覧", "views")}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="size-4" />
          <span>
            {work.commentsCount} {t("コメント", "comments")}
          </span>
        </div>
      </div>

      {/* 説明文 */}
      {work.description && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              {t("説明", "Description")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(work.description || "", "説明")}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed">
              {shouldShowDescriptionExpand && !isDescriptionExpanded
                ? `${work.description.slice(0, 150)}...`
                : work.description}
            </p>
            {shouldShowDescriptionExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="h-auto p-0 text-primary hover:bg-transparent"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="mr-1 size-4" />
                    {t("閉じる", "Show less")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 size-4" />
                    {t("もっと見る", "Show more")}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* タグ */}
      {work.tagNames && work.tagNames.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">{t("タグ", "Tags")}</h3>
          <GalleryTagList
            tags={work.tagNames}
            variant="outline"
            size="md"
            getTagHref={(tag) => `/posts/gallery?q=${encodeURIComponent(tag)}`}
          />
        </div>
      )}

      {/* プロンプト */}
      {work.prompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">
              {t("プロンプト", "Prompt")}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(work.prompt || "", "プロンプト")}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <p className="font-mono text-muted-foreground text-sm">
              {shouldShowPromptExpand && !isPromptExpanded
                ? `${work.prompt.slice(0, 200)}...`
                : work.prompt}
            </p>
            {shouldShowPromptExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                className="mt-2 h-auto p-0 text-primary hover:bg-transparent"
              >
                {isPromptExpanded ? (
                  <>
                    <ChevronUp className="mr-1 size-4" />
                    {t("閉じる", "Show less")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 size-4" />
                    {t("もっと見る", "Show more")}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
