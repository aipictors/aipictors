import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { type FragmentOf, graphql } from "gql.tada"
import { useContext, useEffect } from "react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  HomeNovelsWorkListItemFragment,
  HomeNovelsWorksSection,
} from "~/routes/($lang)._main._index/components/home-novels-works-section"
import {
  HomeVideosWorkListItemFragment,
  HomeVideosWorksSection,
} from "~/routes/($lang)._main._index/components/home-video-works-section"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"

type Props = {
  isCropped?: boolean
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
  style?: IntrospectionEnum<"ImageStyle">
  onSelect?: (index: number) => void
  updateWorks: (works: FragmentOf<typeof PhotoAlbumWorkFragment>[]) => void
}

/**
 * トップ画面人気作品一覧
 */
export function HomeNewUsersSensitiveWorkListSection(props: Props) {
  const appContext = useContext(AuthContext)

  const { data: worksResp } = useSuspenseQuery(WorksQuery, {
    skip: appContext.isLoading,
  })

  useEffect(() => {
    if (props.updateWorks) {
      props.updateWorks(
        worksResp?.newUserWorks as FragmentOf<typeof PhotoAlbumWorkFragment>[],
      )
    }
  }, [worksResp?.newUserWorks, props.updateWorks])

  return (
    <div className="space-y-4">
      {(props.workType === "WORK" || props.workType === null) && (
        <HomeWorkSection
          title={""}
          works={worksResp?.newUserWorks || []}
          isCropped={props.isCropped}
          isShowProfile={true}
          onSelect={props.onSelect}
        />
      )}
      {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
        <HomeNovelsWorksSection
          title={""}
          works={worksResp?.newUserWorks || []}
          onSelect={props.onSelect}
        />
      )}
      {props.workType === "VIDEO" && (
        <HomeVideosWorksSection
          title={""}
          works={worksResp?.newUserWorks || []}
          isAutoPlay={true}
          onSelect={props.onSelect}
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
