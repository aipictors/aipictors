import { useQuery } from "@apollo/client/index"
import { useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import type { SearchType } from "~/routes/($lang)._main.search/utils/search-filters"
import { formatSearchTabCount } from "~/routes/($lang)._main.search/utils/search-tab-count"

/** usersSearchCount の上限（これと同じなら「以上」） */
const USERS_COUNT_LIMIT = 300

/** tagsSearchCount の上限（これより多ければ「1,000+」） */
const TAGS_COUNT_LIMIT = 1000

/**
 * 検索した言葉で「作品」「ユーザー」「タグ」のどれを見るかの切り替え（アプリの検索と同じ）
 *
 * 作品の件数は検索結果と一緒に取った数（年齢区分・絞り込みに合う）。
 * ユーザー・タグの件数は結果を出したあとに 1 回の GraphQL で取り、届かなければ件数なしでタブだけ出す
 */
export function SearchTypeTabs(props: {
  type: SearchType
  query: string
  /** 今の作品の一覧の件数 */
  worksCount: number
  /** 作品の件数が上限で止めた数か（キーワードの検索は 1,000 件まで数える） */
  isWorksCountAtLeast: boolean
}) {
  const t = useTranslation()
  const [, setSearchParams] = useSearchParams()

  const { data, refetch } = useQuery(searchTabCountsQuery, {
    variables: { search: props.query },
    ssr: false,
    errorPolicy: "ignore",
  })

  // ユーザーの件数はユーザーの検索が保存した候補からだけ出すので、ユーザーのタブを開いたあとに取り直す
  const usersCount = data?.usersSearchCount
  const tagsCount = data?.tagsSearchCount
  useEffect(() => {
    if (props.type !== "users" || usersCount !== null) return
    const timer = setTimeout(() => {
      refetch().catch(() => undefined)
    }, 2000)
    return () => clearTimeout(timer)
  }, [props.type, usersCount, refetch])

  const tabs = [
    [
      "works",
      t("作品", "Works"),
      formatSearchTabCount(props.worksCount, props.isWorksCountAtLeast),
    ],
    [
      "users",
      t("ユーザー", "Users"),
      formatSearchTabCount(
        usersCount,
        usersCount !== null &&
          usersCount !== undefined &&
          usersCount >= USERS_COUNT_LIMIT,
      ),
    ],
    [
      "tags",
      t("タグ", "Tags"),
      formatSearchTabCount(
        tagsCount === null || tagsCount === undefined
          ? tagsCount
          : Math.min(tagsCount, TAGS_COUNT_LIMIT),
        tagsCount !== null &&
          tagsCount !== undefined &&
          tagsCount > TAGS_COUNT_LIMIT,
      ),
    ],
  ] as const

  return (
    <div
      role="tablist"
      aria-label={t("検索する対象", "Search for")}
      // アプリの検索結果と同じ、下線のタブを横幅いっぱいに 3 つ（PC は左に寄せる）
      className="mb-4 flex border-b md:mb-6"
    >
      {tabs.map(([type, label, count]) => (
        <button
          key={type}
          type="button"
          role="tab"
          aria-selected={props.type === type}
          onClick={() => {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev)
                if (type === "works") next.delete("type")
                else next.set("type", type)
                // ユーザー・タグの一覧は作品のページ番号を使わない
                next.delete("page")
                return next
              },
              { preventScrollReset: true },
            )
          }}
          className={cn(
            "relative flex h-12 min-w-0 flex-1 items-center justify-center text-[15px] transition-colors md:w-40 md:flex-none",
            props.type === type
              ? "font-extrabold text-foreground"
              : "font-semibold text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="relative inline-flex h-full min-w-0 items-center gap-1 whitespace-nowrap">
            {label}
            {count !== null && (
              <span className="font-medium text-muted-foreground text-xs tabular-nums">
                ({count})
              </span>
            )}
            {props.type === type && (
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-foreground" />
            )}
          </span>
        </button>
      ))}
    </div>
  )
}

const searchTabCountsQuery = graphql(
  `query SearchTabCounts($search: String!) {
    usersSearchCount(search: $search)
    tagsSearchCount(search: $search)
  }`,
)
