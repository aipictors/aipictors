import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "~/routes/($lang)._main._index/components/home-novels-works-section"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "~/routes/($lang)._main._index/components/home-video-works-section"

type Props = {
  isCropped?: boolean
  page: number
  setPage: (page: number) => void
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  style?: IntrospectionEnum<"ImageStyle">
}

/**
 * トップ画面人気作品一覧
 */
export function HomeHotWorksSection(props: Props) {
  const appContext = useContext(AuthContext)

  const perPageCount = props.workType === "VIDEO" ? 8 : 32

  const { data: worksResp } = useSuspenseQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: props.page * perPageCount,
      limit: perPageCount,
      where: {
        isSensitive: false,
        ...(props.workType !== null && {
          workType: props.workType,
        }),
      },
    },
  })

  return (
    <div className="space-y-4">
      {(props.workType === "WORK" || props.workType === null) && (
        <HomeWorkSection
          title={""}
          works={worksResp?.popularWorks || []}
          isCropped={props.isCropped}
          isShowProfile={true}
        />
      )}
      {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
        <HomeNovelsWorksSection
          title={""}
          works={worksResp?.popularWorks || []}
        />
      )}
      {props.workType === "VIDEO" && (
        <HomeVideosWorksSection
          title={""}
          works={worksResp?.popularWorks || []}
          isAutoPlay={true}
        />
      )}
    </div>
  )
}

const WorksQuery = graphql(
  `query Works($where: PopularWorksWhereInput!) {
    popularWorks(where: $where) {
      ...HomeWork
      ...HomeNovelsWorkListItem
      ...HomeVideosWorkListItem
    }
  }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)
