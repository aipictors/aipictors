import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import { config } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"

type Props = {
  works: FragmentOf<typeof HomePromotionWorkFragment>[]
  /** 推薦が少ないときに後ろへ続けるおすすめ作品（推薦とは分けて「ほかのおすすめ」として出す） */
  fillWorks?: FragmentOf<typeof HomePromotionWorkFragment>[]
  style?: IntrospectionEnum<"ImageStyle">
  onSelect?: (index: string) => void
  onWorksLoaded?: (
    works: FragmentOf<typeof HomePromotionWorkFragment>[],
  ) => void
}

/** 推薦の最後の行を埋めるのに使うおすすめの数（6 列で 1 枚だけのときに 5 枚） */
export const RECOMMENDED_PAD_COUNT = 5

/**
 * ユーザからの推薦作品
 */
export function HomeWorksUsersRecommendedSection(props: Props) {
  const appContext = useContext(AuthContext)

  // 推薦作品。サーバーで取った一覧があればそれを使い、ブラウザでは取り直さない（同じ問い合わせが 2 回になっていた）。
  // ログイン中の人のいいね済みは LikeButton が自分で確かめる
  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading || props.works.length > 0,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.promotion,
      where: {
        isRecommended: true,
        sort: "DESC",
        ratings: ["G", "R15"],
        ...(props.style && {
          style: props.style,
        }),
      },
    },
  })

  const workDisplayed = recommendedWorksResp?.works ?? props.works
  // ブラウザで取り直したとき（サーバーの一覧が無いとき）は埋める分も無い
  const fillWorks = recommendedWorksResp ? [] : (props.fillWorks ?? [])
  // 推薦の最後の行の穴は、おすすめの先頭で埋める（6 列で 5 件だけのときなど。最大で 1 行に足りない 5 枚）。
  // 埋めに使った作品は「ほかのおすすめ」には出さない
  const padWorks = fillWorks.slice(0, RECOMMENDED_PAD_COUNT)
  const restFillWorks = fillWorks.slice(RECOMMENDED_PAD_COUNT)

  useEffect(() => {
    // 作品のダイアログで前後に移れるように、埋めた分も続けて渡す
    props.onWorksLoaded?.([...workDisplayed, ...fillWorks])
  }, [workDisplayed, props.fillWorks])

  const t = useTranslation()

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeRecommendedWorkList
          title={t("ユーザからの推薦", "Recommended by users")}
          works={workDisplayed}
          description={t(
            "Aipictors＋の会員が推薦した作品",
            "Works recommended by Aipictors+ members",
          )}
          link="/home/recommended"
          // 「More」だけだとリンク先が分からない（Lighthouse の SEO「リンクにわかりやすいテキスト」）
          linkLabel={t("もっと見る", "All recommended")}
          isCropped={false}
          isShowProfile={true}
          fillRows={true}
          padWorks={padWorks}
          autoPlayVideoPreview={true}
          // ホームで最初に見える画像（スマホの LCP）。lazy のままだと読み込みが後回しになっていた
          priorityCount={2}
          onSelect={props.onSelect}
        />
      )}
      {restFillWorks.length > 0 && (
        <HomeRecommendedWorkList
          title={t("ほかのおすすめ", "More picks")}
          description={t(
            "直近 3 日の作品から、反応の多い作品やあなたの好みに近い作品",
            "Popular recent works picked for you",
          )}
          works={restFillWorks}
          link="/recommended"
          linkLabel={t("おすすめをもっと見る", "More recommended")}
          isCropped={false}
          isShowProfile={true}
          fillRows={true}
          autoPlayVideoPreview={true}
          onSelect={props.onSelect}
        />
      )}
    </>
  )
}

export const HomePromotionWorkFragment = graphql(
  `fragment HomePromotionWork on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomePromotionWork
    }
  }`,
  [HomePromotionWorkFragment],
)
