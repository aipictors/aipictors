import { useQuery } from "@apollo/client/index"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import {
  HomeWorkSection,
  HomeWorkFragment,
} from "~/routes/($lang)._main._index/components/home-work-section"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  works: FragmentOf<typeof HomeGeneratedWorkFragment>[]
  style?: IntrospectionEnum<"ImageStyle">
  onSelect?: (index: string) => void
}

/**
 * 生成機能で作成された作品一覧
 */
export function HomeGeneratedWorksSection(props: Props) {
  const appContext = useContext(AuthContext)
  const t = useTranslation()

  // 生成機能で作成された最近の人気作品
  const { data: generatedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.promotion,
      where: {
        ratings: ["G", "R15"],
        isFeatured: true, // 画像生成の作品フラグ
        hasPrompt: true, // プロンプトが存在する
        orderBy: "LIKES_COUNT", // いいね数順
        isNowCreatedAt: true, // 最新
        ...(props.style && {
          style: props.style,
        }),
      },
    },
  })

  const workDisplayed = generatedWorksResp?.works ?? props.works

  return (
    <>
      {workDisplayed.length > 0 && (
        <HomeWorkSection
          title={t("AI生成作品", "AI Generated Works")}
          works={workDisplayed}
          isCropped={false}
          isShowProfile={true}
          onSelect={props.onSelect}
          link={"/generation"}
        />
      )}
    </>
  )
}

export const HomeGeneratedWorkFragment = graphql(
  `fragment HomeGeneratedWork on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const WorksQuery = graphql(
  `query GeneratedWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeWork
    }
  }`,
  [HomeWorkFragment],
)
