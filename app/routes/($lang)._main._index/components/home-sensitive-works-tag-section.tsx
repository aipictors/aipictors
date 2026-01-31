import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext } from "react"
import { config } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  works: FragmentOf<typeof HomeTagWorkFragment>[]
  tag: string
  secondWorks: FragmentOf<typeof HomeTagWorkFragment>[]
  secondTag: string
  style?: IntrospectionEnum<"ImageStyle">
  isCropped?: boolean
}

/**
 * タグ作品一覧
 */
export function HomeSensitiveWorksTagSection (props: Props) {
  const appContext = useContext(AuthContext)

  const { data: firstTagWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.tag,
      where: {
        ratings: ["R18", "R18G"],
        isSensitive: true,
        isNowCreatedAt: true,
        search: props.tag,
        orderBy: "LIKES_COUNT",
        ...(props.style && {
          style: props.style,
        }),
      },
    },
  })

  const { data: secondTagWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.tag,
      where: {
        ratings: ["R18", "R18G"],
        isSensitive: true,
        isNowCreatedAt: true,
        search: props.secondTag,
        orderBy: "LIKES_COUNT",
        ...(props.style && {
          style: props.style,
        }),
      },
    },
  })

  const workDisplayed = firstTagWorksResp?.works ?? props.works
  const secondWorkDisplayed = secondTagWorksResp?.works ?? props.secondWorks

  const combinedWorks = [
    ...(workDisplayed ?? []),
    ...(secondWorkDisplayed ?? []),
  ]

  const t = useTranslation()

  return (
    <>
      <HomeWorkSection
        title={t("タグ作品", "Tag Works")}
        works={combinedWorks}
        isCropped={props.isCropped}
      />
    </>
  )
}

export const HomeTagWorkFragment = graphql(
  `fragment HomeTagWork on WorkNode @_unmask {
    id
    ...HomeWork
  }`,
  [HomeWorkFragment],
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomeTagWork
    }
  }`,
  [HomeTagWorkFragment],
)
