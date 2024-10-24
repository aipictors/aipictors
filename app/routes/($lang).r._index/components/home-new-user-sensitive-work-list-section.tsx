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
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  style?: IntrospectionEnum<"ImageStyle">
}

/**
 * トップ画面人気作品一覧
 */
export function HomeNewUsersSensitiveWorkListSection(props: Props) {
  const appContext = useContext(AuthContext)

  const { data: worksResp } = useSuspenseQuery(WorksQuery, {
    skip: appContext.isLoading,
  })

  return (
    <div className="space-y-4">
      {(props.workType === "WORK" || props.workType === null) && (
        <HomeWorkSection
          title={""}
          works={worksResp?.newUserWorks || []}
          isCropped={props.isCropped}
          isShowProfile={true}
        />
      )}
      {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
        <HomeNovelsWorksSection
          title={""}
          works={worksResp?.newUserWorks || []}
        />
      )}
      {props.workType === "VIDEO" && (
        <HomeVideosWorksSection
          title={""}
          works={worksResp?.newUserWorks || []}
          isAutoPlay={true}
        />
      )}
    </div>
  )
}

const WorksQuery = graphql(
  `query Works {
    newUserWorks: newUserWorks(
      offset: 0,
      limit: 20,
      where: {
        ratings: [R18, R18G],
        isNowCreatedAt: true
      }
    ) {
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
