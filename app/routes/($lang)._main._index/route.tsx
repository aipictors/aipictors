import { loaderClient } from "~/lib/loader-client"
import {
  HomeAwardWorkSection,
  HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeBanners,
  HomeBannerWorkFragment,
} from "~/routes/($lang)._main._index/components/home-banners"
import {
  HomeTagList,
  HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagFragment,
  HomeTagsSection,
} from "~/routes/($lang)._main._index/components/home-tags-section"
import {
  HomePromotionWorkFragment,
  HomeWorksUsersRecommendedSection,
} from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import {
  HomeTagWorkFragment,
  HomeWorksTagSection,
} from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"
import {
  HomeNewUsersWorksFragment,
  HomeNewUsersWorksSection,
} from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { createClient as createCmsClient } from "microcms-js-sdk"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"
import {
  HomeNewPostedUsersFragment,
  HomeNewUsersSection,
} from "~/routes/($lang)._main._index/components/home-new-users-section"
import {
  HomeNewCommentsFragment,
  HomeNewCommentsSection,
} from "~/routes/($lang)._main._index/components/home-new-comments"
import { useState, useEffect, Suspense, useMemo } from "react"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { ArrowDownWideNarrow, List, Navigation } from "lucide-react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { FollowTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-tags-feed-contents"
import { FollowUserFeedContents } from "~/routes/($lang)._main._index/components/follow-user-feed-contents"
import { HomeHotWorksSection } from "~/routes/($lang)._main._index/components/home-hot-works-section"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { Button } from "~/components/ui/button"
import { useLocale } from "~/hooks/use-locale"
import { useUpdateQueryParams } from "~/hooks/use-update-query-params"
import { useMutation, useQuery } from "@apollo/client/index"
import { HomeAwardWorksSection } from "~/routes/($lang)._main._index/components/home-award-works"
import { HomeReleaseList } from "~/routes/($lang)._main._index/components/home-release-list"
import { HomeNewUsersWorkListSection } from "~/routes/($lang)._main._index/components/home-new-user-work-list-section"
import { SensitiveChangeConfirmDialog } from "~/routes/($lang)._main._index/components/sensitive-change-confirm-dialog"
import { HomePaginationWorksSection } from "~/routes/($lang)._main._index/components/home-pagination-works-section"
import { WorkViewerDialog } from "~/components/work/work-viewer-dialog"
import type { FragmentOf } from "gql.tada"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME, undefined, props.params.lang)
}

const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2)
  const day = `0${date.getUTCDate()}`.slice(-2)

  return `${year}/${month}/${day}`
}

export async function loader(_props: LoaderFunctionArgs) {
  const categories = ["ゆめかわ", "ダークソウル", "パステル", "ちびキャラ"]

  const getRandomCategories = () => {
    const currentTime = new Date()
    const secondSeed = Math.floor(currentTime.getTime() / 1000)

    const seededRandom = (seed: number, str: string) => {
      const combined = seed + str.charCodeAt(0)
      const x = Math.sin(combined) * 10000
      return x - Math.floor(x)
    }

    const randomCategories = categories
      .map((cat) => ({
        cat,
        sortKey: seededRandom(secondSeed, cat),
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, 2)
      .map((item) => item.cat)

    return randomCategories
  }

  const randomCategories = getRandomCategories()

  const now = getJstDate()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const releaseList: MicroCmsApiReleaseResponse = await microCmsClient.get({
    endpoint: `releases?orders=-createdAt&limit=${4}&offset=0`,
  })

  const result = await loaderClient.query({
    query: query,
    variables: {
      awardDay: yesterday.getDate(),
      awardMonth: yesterday.getMonth() + 1,
      awardYear: yesterday.getFullYear(),
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      adWorksLimit: config.query.homeWorkCount.ad,
      promotionWorksLimit: config.query.homeWorkCount.promotion,
      awardWorksLimit: config.query.homeWorkCount.award,
      categoryFirst: randomCategories[0],
      categorySecond: randomCategories[1],
      tagWorksLimit: config.query.homeWorkCount.tag,
      newUsersWorksLimit: config.query.homeWorkCount.newUser,
    },
  })

  // 新着作品データを取得
  const newWorksResult = await loaderClient.query({
    query: newWorksQuery,
    variables: {
      offset: 0,
      limit: 20, // 初期表示用の作品数
      where: {
        isNowCreatedAt: true,
        ratings: ["G", "R15"],
      },
    },
  })

  // 人気作品データを取得
  const hotWorksResult = await loaderClient.query({
    query: hotWorksQuery,
    variables: {
      offset: 0,
      limit: 20, // 初期表示用の作品数
      where: {
        isNowCreatedAt: true,
        ratings: ["G", "R15"],
        orderBy: "LIKES_COUNT",
      },
    },
  })

  const awardDateText = getUtcDateString(yesterday)

  return {
    ...result.data,
    awardDateText: awardDateText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
    releaseList,
    // 初期表示用の新着・人気作品データを追加
    initialNewWorks: newWorksResult.data?.works || [],
    initialHotWorks: hotWorksResult.data?.works || [],
  }
}

// カスタムフック: スクロール位置の保存・復元（windowオブジェクトを使用しない）
function useScrollRestoration(isMounted: boolean) {
  useEffect(() => {
    if (isMounted) {
      // スクロール位置の復元を行わない（React Routerが自動的に保持する場合）
    }
  }, [isMounted])
}

export default function Home() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const [searchParams, _setSearchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  // タブ関連
  const [newWorksPage, setNewWorksPage] = useState(0)
  const [followUserFeedPage, setFollowUserFeedPage] = useState(0)
  const [followTagFeedPage, setFollowTagFeedPage] = useState(0)

  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(null)
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(null)
  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(null)

  const navigate = useNavigate()

  // 期間指定の state を追加し、URL パラメータから初期値を読む
  const [timeRange, setTimeRange] = useState<string>(
    searchParams.get("timeRange") || "ALL",
  )

  const location = useLocale()

  // タブ（home / new / follow-user / follow-tag）
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") || "home",
  )

  // 新着タブ内（「新着 / 人気 / 新規ユーザ」）切り替え
  const [workView, setWorkView] = useState(searchParams.get("view") || "new")

  const [internalIsPagination, setInternalIsPagination] = useState<boolean>(
    searchParams.get("isPagination") === "true",
  )
  const [newTabIsPagination, setNewTabIsPagination] = useState<boolean>(
    searchParams.get("isPagination") === "true",
  )
  const [followUserTabIsPagination, setFollowUserTabIsPagination] =
    useState<boolean>(searchParams.get("isPagination") === "true")
  const [followTagTabIsPagination, setFollowTagTabIsPagination] =
    useState<boolean>(searchParams.get("isPagination") === "true")

  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, _setIsDialogMode] = useState(false)

  // ダイアログ制御
  const [dialogIndex, setDialogIndex] = useState<number | null>(null)

  // 作品データの管理用state
  const [currentWorks, setCurrentWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])

  // ホームタブ用の作品データを管理するstate
  const [homeWorks, setHomeWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])

  // ホームタブの作品データを初期化
  useEffect(() => {
    if (data && currentTab === "home") {
      const works: FragmentOf<typeof PhotoAlbumWorkFragment>[] = []

      // バナー作品を追加
      if (data.adWorks) {
        // HomeBannerWorkFragment から PhotoAlbumWorkFragment へ変換
        const bannerWorks = data.adWorks.filter(
          (work) => work && typeof work === "object" && "id" in work,
        )
        works.push(
          ...(bannerWorks as unknown as FragmentOf<
            typeof PhotoAlbumWorkFragment
          >[]),
        )
      }

      // プロモーション作品を追加
      if (data.promotionWorks) {
        works.push(...data.promotionWorks)
      }

      // 新規ユーザ作品を追加
      if (data.newUserWorks) {
        works.push(...data.newUserWorks)
      }

      // 受賞作品を追加
      if (data.workAwards) {
        // award.work を PhotoAlbumWorkFragment 型に変換する
        const convertAwardWorkToPhotoAlbumWork = (
          work: Record<string, unknown>,
        ): FragmentOf<typeof PhotoAlbumWorkFragment> | null => {
          if (!work) return null
          // 必要なフィールドをマッピング
          return {
            id: work.id,
            isMyRecommended: work.isMyRecommended ?? false,
            title: work.title,
            mdUrl: work.mdUrl ?? "",
            accessType: work.accessType ?? "PUBLIC",
            type: work.type ?? "WORK",
            adminAccessType: work.adminAccessType ?? "PUBLIC",
            likesCount: work.likesCount ?? 0,
            isLiked: work.isLiked ?? false,
            smallThumbnailImageURL: work.smallThumbnailImageURL ?? "",
            smallThumbnailImageHeight: work.smallThumbnailImageHeight ?? 0,
            smallThumbnailImageWidth: work.smallThumbnailImageWidth ?? 0,
            thumbnailImagePosition: work.thumbnailImagePosition ?? null,
            subWorksCount: work.subWorksCount ?? 0,
            user: work.user ?? null,
            nanoid: work.nanoid ?? null,
            // 他に必要なフィールドがあればここで追加
          } as FragmentOf<typeof PhotoAlbumWorkFragment>
        }

        works.push(
          ...data.workAwards
            .filter((award) => award.work !== null)
            .map((award) => convertAwardWorkToPhotoAlbumWork(award.work!))
            .filter(
              (work): work is FragmentOf<typeof PhotoAlbumWorkFragment> =>
                work !== null,
            ),
        )
      }

      // タグ作品を追加
      if (data.firstTagWorks) {
        works.push(...data.firstTagWorks)
      }
      if (data.secondTagWorks) {
        works.push(...data.secondTagWorks)
      }

      setHomeWorks(works)
    }
  }, [data, currentTab])

  /**
   * マウント時に、すでに URL に入っているクエリパラメータを用いて
   * 各 state を初期化する
   */
  useEffect(() => {
    // 初回のみ実行
    if (!isMounted) {
      // ページ番号
      const page = searchParams.get("page")
      const pageNumber = page ? Number.parseInt(page, 10) : 0

      if (!Number.isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= 100) {
        if (currentTab === "new") {
          setNewWorksPage(pageNumber)
        } else if (currentTab === "follow-user") {
          setFollowUserFeedPage(pageNumber)
        } else if (currentTab === "follow-tag") {
          setFollowTagFeedPage(pageNumber)
        }
      }

      // internalIsPagination
      const isPaginationParam = searchParams.get("isPagination")
      if (isPaginationParam === "true") {
        setInternalIsPagination(true)
      } else if (isPaginationParam === "false") {
        setInternalIsPagination(false)
      }

      // workType
      const wtParam = searchParams.get("workType")
      if (wtParam && wtParam !== "ALL") {
        setWorkType(wtParam as IntrospectionEnum<"WorkType">)
      }

      // isPromptPublic
      const isPromptParam = searchParams.get("isPromptPublic")
      if (isPromptParam === "true") {
        setIsPromptPublic(true)
      } else if (isPromptParam === "false") {
        setIsPromptPublic(false)
      }

      // sortType
      const sortTypeParam = searchParams.get("sortType")
      if (
        sortTypeParam === "DATE_CREATED" ||
        sortTypeParam === "LIKES_COUNT" ||
        sortTypeParam === "COMMENTS_COUNT"
      ) {
        setSortType(sortTypeParam as IntrospectionEnum<"WorkOrderBy">)
      }

      // timeRange
      const tr = searchParams.get("timeRange")
      if (tr && tr !== "ALL") {
        setTimeRange(tr)
      }

      // workView
      const viewParam = searchParams.get("view")
      if (viewParam) {
        setWorkView(viewParam)
      }

      setIsMounted(true)
    }
  }, [isMounted, searchParams, currentTab])

  // タブ切り替え時にステートをリセットする関数
  const resetTabState = (tab: string) => {
    console.log(`Resetting state for tab: ${tab}`)

    // セッションストレージから関連するスクロール位置データをクリア
    if (typeof window !== "undefined") {
      // 無限スクロールのスクロール位置をクリア
      sessionStorage.removeItem("scroll-home-works-infinite")
      sessionStorage.removeItem("scroll-follow-user-infinite")
      sessionStorage.removeItem("scroll-follow-tag-infinite")

      // homeWorks-pages:* の形式のすべてのエントリを検索して削除
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("homeWorks-pages:")) {
          console.log("Clearing session storage key:", key)
          sessionStorage.removeItem(key)
        }
      })
    }

    // 現在の作品データを確実にクリア
    setCurrentWorks([])

    // 状態に応じてページ番号も再設定
    if (tab === "new") {
      setNewWorksPage(0)
    } else if (tab === "follow-user") {
      setFollowUserFeedPage(0)
    } else if (tab === "follow-tag") {
      setFollowTagFeedPage(0)
    }
  }

  // タブ変更時（Tabs の onValueChange）などで呼ばれる
  const handleTabChange = (tab: string) => {
    if (currentTab === tab) return // 同じタブの場合は何もしない

    console.log(`Tab changed from ${currentTab} to ${tab}`)

    // 現在の作品データを即時クリア（タブ切り替え時に前のタブのデータが表示されるのを防ぐ）
    setCurrentWorks([])

    // タブ情報を更新
    setCurrentTab(tab)

    // タブ切り替え時にページをリセット
    setNewWorksPage(0)
    setFollowUserFeedPage(0)
    setFollowTagFeedPage(0)

    // 各タブ専用のページネーションモードを継承する
    let isPaginationValue = false
    if (tab === "new") {
      isPaginationValue = newTabIsPagination
    } else if (tab === "follow-user") {
      isPaginationValue = followUserTabIsPagination
    } else if (tab === "follow-tag") {
      isPaginationValue = followTagTabIsPagination
    } else {
      isPaginationValue = internalIsPagination
    }
    setInternalIsPagination(isPaginationValue)

    // スクロール位置をリセット
    window.scrollTo(0, 0)

    // 既存パラメータをコピーして編集
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("tab", tab)
    newSearchParams.set("isPagination", isPaginationValue.toString())

    // 別タブでは page 不要なので消す or 0 にする
    if (tab === "new") {
      newSearchParams.set("page", "0")
    } else if (tab === "follow-user") {
      newSearchParams.set("page", "0")
    } else if (tab === "follow-tag") {
      newSearchParams.set("page", "0")
    } else {
      newSearchParams.delete("page")
    }

    updateQueryParams(newSearchParams)

    // タブ切り替え後に少し遅延させてリセットする（レンダリング後に実行させるため）
    // 300msに短縮して、より早くリセットを行う
    setTimeout(() => {
      resetTabState(tab)
    }, 300)
  }

  /**
   * タブ or ページ番号の変更時にクエリパラメータを更新
   */
  useEffect(() => {
    if (!isMounted) return
    const newSearchParams = new URLSearchParams(searchParams)

    // タブ
    newSearchParams.set("tab", currentTab)

    // ページ
    if (currentTab === "new") {
      newSearchParams.set("page", newWorksPage.toString())
    } else if (currentTab === "follow-user") {
      newSearchParams.set("page", followUserFeedPage.toString())
    } else if (currentTab === "follow-tag") {
      newSearchParams.set("page", followTagFeedPage.toString())
    } else {
      newSearchParams.delete("page")
    }

    // internalIsPagination
    if (internalIsPagination) {
      newSearchParams.set("isPagination", "true")
    } else {
      newSearchParams.set("isPagination", "false")
    }

    // 期間指定
    if (currentTab === "new") {
      newSearchParams.set("timeRange", timeRange)
    }

    updateQueryParams(newSearchParams)
  }, [
    currentTab,
    newWorksPage,
    followUserFeedPage,
    followTagFeedPage,
    isMounted,
    timeRange,
    updateQueryParams,
    searchParams,
    internalIsPagination,
  ])

  useEffect(() => {
    const urlTab = searchParams.get("tab") || "home"
    if (urlTab !== currentTab) {
      setCurrentTab(urlTab)
    }
  }, [searchParams])

  /**
   * 新着タブ内の「新着 / 人気 / 新規ユーザ」切り替え
   */
  const handleWorkViewChange = (view: string) => {
    if (workView === view) return // 同じビューの場合は何もしない

    // 現在の作品データをクリア（ビュー切り替え時に前のビューのデータが表示されるのを防ぐ）
    setCurrentWorks([])

    setWorkView(view)
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("view", view)

    // ページをリセット
    newSearchParams.set("page", "0")
    setNewWorksPage(0)

    updateQueryParams(newSearchParams)
  }

  // workType チェンジ
  const handleWorkTypeChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === "ALL") {
      newSearchParams.delete("workType")
      setWorkType(null)
    } else {
      newSearchParams.set("workType", value)
      setWorkType(value as IntrospectionEnum<"WorkType">)
    }

    // ページリセット
    newSearchParams.set("page", "0")
    setNewWorksPage(0)

    updateQueryParams(newSearchParams)
  }

  // プロンプト公開有無
  const handlePromptChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === "ALL") {
      newSearchParams.delete("isPromptPublic")
      setIsPromptPublic(null)
    } else {
      const isPrompt = value === "prompt"
      newSearchParams.set("isPromptPublic", isPrompt ? "true" : "false")
      setIsPromptPublic(isPrompt)
    }

    updateQueryParams(newSearchParams)
  }

  // ソート
  const handleSortTypeChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === "ALL") {
      newSearchParams.delete("sortType")
      setSortType(null)
    } else {
      newSearchParams.set("sortType", value)
      setSortType(value as IntrospectionEnum<"WorkOrderBy">)
    }

    updateQueryParams(newSearchParams)
  }

  // 期間指定
  const handleTimeRangeChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    setTimeRange(value)
    if (value === "ALL") {
      newSearchParams.delete("timeRange")
    } else {
      newSearchParams.set("timeRange", value)
    }

    updateQueryParams(newSearchParams)
  }

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: {
      where: {
        isSensitive: false,
        page: "work",
      },
    },
  })
  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      await updateClickedCountCustomerAdvertisement({
        variables: {
          id: advertisements.randomCustomerAdvertisement.id,
        },
      })
    }
  }

  const passData = pass?.viewer?.currentPass
  const isSubscriptionUser =
    passData?.type === "LITE" ||
    passData?.type === "STANDARD" ||
    passData?.type === "PREMIUM"

  // スクロール位置復元しない
  useScrollRestoration(isMounted)

  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // ダイアログで表示する作品データを決定
  const displayedWorks = useMemo(() => {
    switch (currentTab) {
      case "home":
        return homeWorks

      case "new":
      case "follow-user":
      case "follow-tag":
        return currentWorks

      default:
        return []
    }
  }, [currentTab, homeWorks, currentWorks])

  // タブごとのページネーション状態を更新する関数
  const updateTabPagination = (isPagination: boolean) => {
    const p = new URLSearchParams(searchParams)
    p.set("isPagination", isPagination.toString())

    // 現在のタブに応じてステート変数を更新
    switch (currentTab) {
      case "new":
        setNewTabIsPagination(isPagination)
        break
      case "follow-user":
        setFollowUserTabIsPagination(isPagination)
        break
      case "follow-tag":
        setFollowTagTabIsPagination(isPagination)
        break
      default:
        // ホームタブなどの場合
        break
    }

    // 共通のページネーション状態も更新（後方互換性のため）
    setInternalIsPagination(isPagination)

    updateQueryParams(p)
  }

  // 作品クリック時の処理
  const openWork = (idx: number) => {
    console.log("Open work at index:", idx)
    console.log("Displayed works:", displayedWorks)
    console.log("Current tab:", currentTab)

    if (idx < 0 || idx >= displayedWorks.length) {
      console.warn(
        "Invalid index for displayed works:",
        idx,
        "Length:",
        displayedWorks.length,
      )
      return
    }

    const work = displayedWorks[idx]
    if (!work) {
      console.warn("Work not found at index:", idx)
      return
    }

    if (isDialogMode) {
      setDialogIndex(idx)
    } else {
      navigate(`/posts/${work.id}`)
    }
  }

  // currentWorksを更新するコールバック関数
  // WorkItem[]をFragmentOf<typeof PhotoAlbumWorkFragment>[]に変換してセット
  const updateCurrentWorks = (works: any[]) => {
    setCurrentWorks(works as FragmentOf<typeof PhotoAlbumWorkFragment>[])
  }

  // 無限スクロール用のloadMore関数
  const loadMore = async () => {
    if (isLoadingMore || !hasNextPage || internalIsPagination) return

    setIsLoadingMore(true)
    try {
      // 現在のタブに応じて追加読み込みを行う
      if (currentTab === "home") {
        // ホームタブの追加読み込みは特別な処理が必要かもしれません
        // 現在の表示中作品のカウントを計算
        const currentCount = homeWorks.length
        // APIの実装に応じて、適切なoffsetとlimitを設定してAPIを呼び出す例:
        // const additionalWorks = await fetchMoreWorks(currentCount, 10);
        // setHomeWorks([...homeWorks, ...additionalWorks]);

        // 今回は読み込みがないと仮定
        if (currentCount > 100) {
          setHasNextPage(false)
        }
      } else if (currentTab === "new") {
        // 新着タブの追加読み込みロジック - 具体的な実装はタブ内コンポーネントに委譲
        // WorksInfiniteModeコンポーネント内で実装済み
      } else if (currentTab === "follow-user") {
        // フォローユーザータブの追加読み込みロジック - FollowUserFeedContentsコンポーネントに委譲
      } else if (currentTab === "follow-tag") {
        // フォロータグタブの追加読み込みロジック - FollowTagsFeedContentsコンポーネントに委譲
      }
    } catch (error) {
      console.error("Failed to load more works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // ホームタブでの作品インデックス計算
  const _getHomeWorkIndex = (sectionIndex: number, workIndex: number) => {
    let totalIndex = 0

    // バナー作品のインデックス
    if (sectionIndex === 0) {
      return workIndex
    }
    totalIndex += data.adWorks?.length || 0

    // プロモーション作品のインデックス
    if (sectionIndex === 1) {
      return totalIndex + workIndex
    }
    totalIndex += data.promotionWorks?.length || 0

    // 新規ユーザ作品のインデックス
    if (sectionIndex === 2) {
      return totalIndex + workIndex
    }
    totalIndex += data.newUserWorks?.length || 0

    // 受賞作品のインデックス
    if (sectionIndex === 3) {
      return totalIndex + workIndex
    }
    totalIndex += data.workAwards?.length || 0

    // 第1タグ作品のインデックス
    if (sectionIndex === 4) {
      return totalIndex + workIndex
    }
    totalIndex += data.firstTagWorks?.length || 0

    // 第2タグ作品のインデックス
    if (sectionIndex === 5) {
      return totalIndex + workIndex
    }

    return totalIndex + workIndex
  }

  if (data === null) {
    return null
  }

  return (
    <>
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <div className="flex items-center sm:gap-x-2 md:gap-x-4">
          <AppAnimatedTabs
            tabs={[
              { label: "ホーム", value: "home" },
              { label: "新着・人気", value: "new" },
              { label: "フォロー新着", value: "follow-user" },
              { label: "お気に入りタグ新着", value: "follow-tag" },
            ]}
            value={currentTab}
            onChange={setCurrentTab}
          />
          <Button
            variant={"secondary"}
            size="sm"
            onClick={() => navigate("/r")}
          >
            {"R-18"}
          </Button>
        </div>

        {/* ---------------------- タブ: ホーム ---------------------- */}
        <TabsContent value="home" className="m-0 flex flex-col space-y-4">
          {data.adWorks && data.adWorks.length > 0 && (
            <HomeBanners
              works={data.adWorks}
              // onSelect={
              //   isDialogMode
              //     ? (idx) => openWork(getHomeWorkIndex(0, idx))
              //     : undefined
              // }
            />
          )}
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="flex flex-col space-y-4 md:w-[56%] lg:w-[64%]">
              <HomeReleaseList releaseList={data.releaseList} />
              {data.dailyTheme && (
                <div>
                  <HomeTagList
                    themeTitle={data.dailyTheme.title}
                    hotTags={data.hotTags}
                  />
                </div>
              )}
              <HomeWorksUsersRecommendedSection
                works={data.promotionWorks}
                // onSelect={
                //   isDialogMode
                //     ? (idx) => openWork(getHomeWorkIndex(1, idx))
                //     : undefined
                // }
              />
              <HomeNewUsersWorksSection
                works={data.newUserWorks}
                // onSelect={
                //   isDialogMode
                //     ? (idx) => openWork(getHomeWorkIndex(2, idx))
                //     : undefined
                // }
              />
              <HomeAwardWorkSection
                awardDateText={data.awardDateText}
                title={t("前日ランキング", "Previous Day Ranking")}
                awards={data.workAwards}
                // onSelect={
                //   isDialogMode
                //     ? (idx) => openWork(getHomeWorkIndex(3, idx))
                //     : undefined
                // }
              />
              <HomeWorksTagSection
                tag={data.firstTag}
                works={data.firstTagWorks}
                secondTag={data.secondTag}
                secondWorks={data.secondTagWorks}
                isCropped={true}
                // onSelect={
                //   isDialogMode
                //     ? (idx) => {
                //         // 第1タグと第2タグの作品を区別する必要がある
                //         const firstTagLength = data.firstTagWorks?.length || 0
                //         if (idx < firstTagLength) {
                //           openWork(getHomeWorkIndex(4, idx))
                //         } else {
                //           openWork(getHomeWorkIndex(5, idx - firstTagLength))
                //         }
                //       }
                //     : undefined
                // }
              />
              <HomeTagsSection
                title={t("人気タグ", "Popular Tags")}
                tags={data.recommendedTags}
              />
            </div>
            <Separator
              orientation="vertical"
              className="hidden h-[100vh] w-[1px] md:block"
            />
            <div className="flex w-full flex-col space-y-4">
              <div className="relative grid gap-4">
                <SensitiveChangeConfirmDialog />
                {!isSubscriptionUser &&
                  advertisements &&
                  advertisements.randomCustomerAdvertisement && (
                    <div className="relative border">
                      <Link
                        onClick={onClickAdvertisement}
                        target="_blank"
                        to={advertisements.randomCustomerAdvertisement.url}
                      >
                        <img
                          src={
                            advertisements.randomCustomerAdvertisement.imageUrl
                          }
                          alt="Advertisement"
                        />
                      </Link>
                      <div className="absolute top-0 right-0">
                        <CrossPlatformTooltip
                          text={t(
                            "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。",
                            "This is a partnered advertisement. We are accepting new advertisers. Please contact us via email or DM.",
                          )}
                        />
                      </div>
                    </div>
                  )}
                {!isSubscriptionUser && (
                  <Link to="/generation">
                    <img
                      src="https://assets.aipictors.com/Aipictors_01.webp"
                      alt="Aipictors Logo"
                    />
                  </Link>
                )}
                {data.newPostedUsers && (
                  <HomeNewUsersSection users={data.newPostedUsers} />
                )}
                {data.newComments && data.newComments.length > 0 && (
                  <HomeNewCommentsSection comments={data.newComments} />
                )}
                {data.workAwards && (
                  <HomeAwardWorksSection works={data.workAwards} />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ---------------------- タブ: 新着・人気 ---------------------- */}
        <TabsContent value="new" className="flex flex-col space-y-4">
          {/* 新着 or 人気 or 新規ユーザの切り替えボタン */}
          <div className="flex space-x-2 md:space-x-4">
            <Button
              variant={workView === "new" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("new")}
              size="sm"
            >
              {t("新着", "New")}
            </Button>
            <Button
              variant={workView === "popular" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("popular")}
              size="sm"
            >
              <div className="flex space-x-1 md:space-x-2">
                <p>{t("人気", "Popular")}</p>
                <CrossPlatformTooltip
                  text={t(
                    "最近投稿された人気作品が表示されます",
                    "Recently popular works",
                  )}
                />
              </div>
            </Button>
            <Button
              variant={workView === "new-user" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("new-user")}
              size="sm"
            >
              <div className="flex space-x-1 md:space-x-2">
                <p className="hidden sm:block">
                  {t("新規ユーザ", "New Users")}
                </p>
                <p className="block sm:hidden">{t("新規", "New")}</p>
                <CrossPlatformTooltip
                  text={t(
                    "新規登録されたユーザの作品一覧です",
                    "List of works by newly registered users",
                  )}
                />
              </div>
            </Button>
          </div>

          {workView === "new" && (
            <div className="space-y-4">
              {/* 絞り込み用のセレクト群 - レスポンシブレイアウト */}
              <div className="space-y-3">
                {/* フィルター行1: 種類、プロンプト、ソート */}
                <div className="grid grid-cols-3 gap-2 md:flex md:space-x-4">
                  {/* 種類 */}
                  <Select
                    value={workType ? workType : ""}
                    onValueChange={handleWorkTypeChange}
                  >
                    <SelectTrigger className="min-w-0 text-xs md:min-w-[120px] md:text-sm">
                      <SelectValue
                        placeholder={
                          workType
                            ? toWorkTypeText({
                                type: workType,
                                lang: location,
                              })
                            : t("種類", "Type")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("種類", "Type")}</SelectItem>
                      <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
                      <SelectItem value="VIDEO">
                        {t("動画", "Video")}
                      </SelectItem>
                      <SelectItem value="NOVEL">
                        {t("小説", "Novel")}
                      </SelectItem>
                      <SelectItem value="COLUMN">
                        {t("コラム", "Column")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* プロンプト有無 */}
                  <Select
                    value={
                      isPromptPublic === null
                        ? "ALL"
                        : isPromptPublic
                          ? "prompt"
                          : "no-prompt"
                    }
                    onValueChange={handlePromptChange}
                  >
                    <SelectTrigger className="min-w-0 text-xs md:min-w-[120px] md:text-sm">
                      <SelectValue
                        placeholder={
                          isPromptPublic === null
                            ? t("プロンプト", "Prompt")
                            : isPromptPublic
                              ? t("あり", "Yes")
                              : t("なし", "No")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        {t("プロンプト", "Prompt")}
                      </SelectItem>
                      <SelectItem value="prompt">{t("あり", "Yes")}</SelectItem>
                      <SelectItem value="no-prompt">
                        {t("なし", "No")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* ソート */}
                  <Select
                    value={sortType ? sortType : ""}
                    onValueChange={handleSortTypeChange}
                  >
                    <SelectTrigger className="min-w-0 text-xs md:min-w-[120px] md:text-sm">
                      <ArrowDownWideNarrow className="h-3 w-3 md:h-4 md:w-4" />
                      <SelectValue
                        placeholder={sortType ? sortType : t("最新", "Latest")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DATE_CREATED">
                        {t("最新", "Latest")}
                      </SelectItem>
                      <SelectItem value="LIKES_COUNT">
                        {t("人気", "Popular")}
                      </SelectItem>
                      <SelectItem value="COMMENTS_COUNT">
                        {t("コメント", "Comments")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* フィルター行2: 期間指定 + 表示方式切り替え */}
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                  {/* 期間指定 */}
                  <Select
                    value={timeRange}
                    onValueChange={handleTimeRangeChange}
                  >
                    <SelectTrigger className="w-full text-xs md:w-auto md:min-w-[120px] md:text-sm">
                      <SelectValue
                        placeholder={
                          timeRange === "ALL"
                            ? t("全期間", "All time")
                            : timeRange
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        {t("全期間", "All time")}
                      </SelectItem>
                      <SelectItem value="TODAY">
                        {t("本日", "Today")}
                      </SelectItem>
                      <SelectItem value="YESTERDAY">
                        {t("昨日", "Yesterday")}
                      </SelectItem>
                      <SelectItem value="WEEK">{t("週間", "Week")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 表示方式切り替え - よりスタイリッシュなデザイン */}
                  <div className="flex rounded-lg bg-muted p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateTabPagination(false)
                      }}
                      className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                        !newTabIsPagination
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      } `}
                    >
                      <List className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {t("フィード", "Feed")}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateTabPagination(true)
                      }}
                      className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                        newTabIsPagination
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      } `}
                    >
                      <Navigation className="h-3 w-3" />
                      <span className="hidden sm:inline">
                        {t("ページ", "Pages")}
                      </span>
                    </Button>

                    {/* <div className="hidden gap-2 md:flex">
                      <Button
                        variant={!isDialogMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsDialogMode(false)}
                        className="flex items-center space-x-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{t("リンク遷移", "Open page")}</span>
                      </Button>
                      <Button
                        variant={isDialogMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsDialogMode(true)}
                        className="flex items-center space-x-1"
                      >
                        <PlaySquare className="h-4 w-4" />
                        <span>{t("ダイアログ", "Dialog")}</span>
                      </Button>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* 新着作品 */}
              <Suspense fallback={<AppLoadingPage />}>
                {newTabIsPagination ? (
                  <HomePaginationWorksSection
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                    timeRange={timeRange}
                    onSelect={isDialogMode ? openWork : undefined}
                    initialWorks={data.initialNewWorks}
                  />
                ) : (
                  <HomeWorksSection
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                    timeRange={timeRange}
                    isPagination={false}
                    onPaginationModeChange={(isPagination) =>
                      updateTabPagination(isPagination)
                    }
                    onSelect={isDialogMode ? openWork : undefined}
                    onWorksLoaded={updateCurrentWorks}
                    initialWorks={data.initialNewWorks}
                  />
                )}
              </Suspense>
            </div>
          )}

          {workView === "popular" && (
            <div className="space-y-4">
              {/* 表示方式切り替え */}
              <div className="flex justify-end">
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateTabPagination(false)
                    }}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      !newTabIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("フィード", "Feed")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateTabPagination(true)
                    }}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      newTabIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Navigation className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("ページ", "Pages")}
                    </span>
                  </Button>
                  {/* <div className="hidden gap-2 md:flex">
                    <Button
                      variant={!isDialogMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsDialogMode(false)}
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{t("リンク遷移", "Open page")}</span>
                    </Button>
                    <Button
                      variant={isDialogMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsDialogMode(true)}
                      className="flex items-center space-x-1"
                    >
                      <PlaySquare className="h-4 w-4" />
                      <span>{t("ダイアログ", "Dialog")}</span>
                    </Button>
                  </div> */}
                </div>
              </div>

              <Suspense fallback={<AppLoadingPage />}>
                <HomeHotWorksSection
                  page={newWorksPage}
                  setPage={setNewWorksPage}
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                  isPagination={newTabIsPagination}
                  onPaginationModeChange={(isPagination) =>
                    updateTabPagination(isPagination)
                  }
                  onSelect={isDialogMode ? openWork : undefined}
                  initialWorks={data.initialHotWorks}
                  onWorksLoaded={updateCurrentWorks}
                />
              </Suspense>
            </div>
          )}

          {workView === "new-user" && (
            <div className="space-y-4">
              {/* 表示方式切り替え */}
              <div className="flex justify-end">
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateTabPagination(false)
                    }}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      !newTabIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("フィード", "Feed")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateTabPagination(true)
                    }}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      newTabIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Navigation className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("ページ", "Pages")}
                    </span>
                  </Button>
                  {/* <div className="hidden gap-2 md:flex">
                    <Button
                      variant={!isDialogMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsDialogMode(false)}
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{t("リンク遷移", "Open page")}</span>
                    </Button>
                    <Button
                      variant={isDialogMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsDialogMode(true)}
                      className="flex items-center space-x-1"
                    >
                      <PlaySquare className="h-4 w-4" />
                      <span>{t("ダイアログ", "Dialog")}</span>
                    </Button>
                  </div> */}
                </div>
              </div>

              <Suspense fallback={<AppLoadingPage />}>
                <HomeNewUsersWorkListSection
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                  onSelect={isDialogMode ? openWork : undefined}
                />
              </Suspense>
            </div>
          )}
        </TabsContent>

        {/* ---------------------- タブ: フォロー中のユーザ ---------------------- */}
        <TabsContent value="follow-user" className="space-y-4">
          {/* Feed / Pages 切り替えボタン */}
          <div className="flex justify-end">
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTabPagination(false)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  !followUserTabIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {t("フィード", "Feed")}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTabPagination(true)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  followUserTabIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Navigation className="h-3 w-3" />
                <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
              </Button>

              {/* <div className="hidden gap-2 md:flex">
                <Button
                  variant={!isDialogMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDialogMode(false)}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("リンク遷移", "Open page")}</span>
                </Button>
                <Button
                  variant={isDialogMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDialogMode(true)}
                  className="flex items-center space-x-1"
                >
                  <PlaySquare className="h-4 w-4" />
                  <span>{t("ダイアログ", "Dialog")}</span>
                </Button>
              </div> */}
            </div>
          </div>

          {/* コンテンツ */}
          <Suspense fallback={<AppLoadingPage />}>
            <FollowUserFeedContents
              page={followUserFeedPage}
              setPage={setFollowUserFeedPage}
              isPagination={followUserTabIsPagination}
              onPaginationModeChange={(isPagination) =>
                updateTabPagination(isPagination)
              }
              onSelect={isDialogMode ? openWork : undefined}
            />
          </Suspense>
        </TabsContent>

        {/* ---------------------- タブ: お気に入りタグ ---------------------- */}
        <TabsContent value="follow-tag" className="space-y-4">
          {/* Feed / Pages 切り替えボタン */}
          <div className="flex justify-end">
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTabPagination(false)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  !followTagTabIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {t("フィード", "Feed")}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateTabPagination(true)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  followTagTabIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Navigation className="h-3 w-3" />
                <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
              </Button>

              {/* <div className="hidden gap-2 md:flex">
                <Button
                  variant={!isDialogMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDialogMode(false)}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t("リンク遷移", "Open page")}</span>
                </Button>
                <Button
                  variant={isDialogMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsDialogMode(true)}
                  className="flex items-center space-x-1"
                >
                  <PlaySquare className="h-4 w-4" />
                  <span>{t("ダイアログ", "Dialog")}</span>
                </Button>
              </div> */}
            </div>
          </div>

          <Suspense fallback={<AppLoadingPage />}>
            <FollowTagsFeedContents
              page={followTagFeedPage}
              setPage={setFollowTagFeedPage}
              isPagination={followTagTabIsPagination}
              onSelect={isDialogMode ? openWork : undefined}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* ────────── 作品ダイアログ ────────── */}
      {dialogIndex !== null && displayedWorks.length > 0 && (
        <WorkViewerDialog
          works={displayedWorks}
          startIndex={dialogIndex}
          onClose={() => setDialogIndex(null)}
          loadMore={!internalIsPagination ? loadMore : undefined}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoadingMore}
        />
      )}
    </>
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

const query = graphql(
  `query HomeQuery(
    $year: Int!
    $month: Int!
    $day: Int!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    $adWorksLimit: Int!
    $promotionWorksLimit: Int!
    $awardWorksLimit: Int!
    $categoryFirst: String!
    $categorySecond: String!
    $tagWorksLimit: Int!
    $newUsersWorksLimit: Int!
  ) {
    adWorks: works(
      offset: 0,
      limit: $adWorksLimit,
      where: {
        isFeatured: true,
        isNowCreatedAt: true,
        ratings: [G],
      }
    ) {
      ...HomeBannerWork
    }
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
    }
    hotTags {
      ...HomeTagListItem
    }
    workAwards(
      offset: 0
      limit: $awardWorksLimit
      where: {
        year: $awardYear
        month: $awardMonth
        day: $awardDay
        isSensitive: false
      }
    ) {
      ...HomeWorkAward
    }
    recommendedTags: recommendedTags(
      limit: 16
      where: {
        isSensitive: false,
      }
    ) {
      ...HomeTag
    }
    firstTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [G],
        search: $categoryFirst,
        isNowCreatedAt: true,
        orderBy: LIKES_COUNT
      }
    ) {
      ...HomeTagWork
    }
    secondTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [G],
        search: $categorySecond,
        isNowCreatedAt: true,
        orderBy: LIKES_COUNT
      }
    ) {
      ...HomeTagWork
    }
    promotionWorks: works(
      offset: 0,
      limit: $promotionWorksLimit,
      where: {
        isRecommended: true
        isNowCreatedAt: true
        ratings: [G, R15]
      }
    ) {
      ...HomePromotionWork
    }
    newUserWorks: newUserWorks(
      offset: 0,
      limit: $newUsersWorksLimit,
      where: {
        ratings: [G, R15],
        isNowCreatedAt: true
      }
    ) {
      ...HomeNewUsersWorks
    }
    newPostedUsers: newPostedUsers(
      offset: 0,
      limit: 8,
    ) {
      ...HomeNewPostedUsers
    }
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: false,
        ratings: [G, R15]
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [
    HomeBannerWorkFragment,
    HomePromotionWorkFragment,
    HomeTagListItemFragment,
    HomeWorkAwardFragment,
    HomeTagFragment,
    HomeTagWorkFragment,
    HomeNewUsersWorksFragment,
    HomeNewPostedUsersFragment,
    HomeNewCommentsFragment,
  ],
)

const viewerCurrentPassQuery = graphql(`
  query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }
`)

export const SideMenuAdvertisementsFragment = graphql(`
  fragment SideMenuAdvertisementsFields on CustomerAdvertisementNode @_unmask {
    id
    imageUrl
    url
    displayProbability
    clickCount
    impressionCount
    isSensitive
    createdAt
    page
    startAt
    endAt
    isActive
  }
`)

const randomCustomerAdvertisementQuery = graphql(
  `query RandomCustomerAdvertisement($where: RandomCustomerAdvertisementWhereInput!) {
    randomCustomerAdvertisement(where: $where) {
      ...SideMenuAdvertisementsFields
    }
  }`,
  [SideMenuAdvertisementsFragment],
)

const updateClickedCountCustomerAdvertisementMutation = graphql(`
  mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }
`)

// 新着作品クエリ
const newWorksQuery = graphql(
  `
  query NewWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

// 人気作品クエリ
const hotWorksQuery = graphql(
  `
  query HotWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)
