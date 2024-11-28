import { AuthContext } from "~/contexts/auth-context"
import {
  HomeWorkFragment,
  HomeWorkSection,
} from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
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
 * トップ画面ホーム作品一覧
 */
export function HomeWorksSection(props: Props) {
  const appContext = useContext(AuthContext)

  const perPageCount = props.workType === "VIDEO" ? 8 : 32

  const { data: worksResp } = useSuspenseQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: props.page * perPageCount,
      limit: perPageCount,
      where: {
        ratings: ["G", "R15"],
        isSensitive: false,
        ...(props.workType !== null && {
          workType: props.workType,
        }),
        ...(props.isPromptPublic !== null && {
          hasPrompt: props.isPromptPublic,
          isPromptPublic: props.isPromptPublic,
        }),
        ...((props.sortType !== null && {
          orderBy: props.sortType,
        }) || { orderBy: "DATE_CREATED" }),
        ...(props.style && {
          style: props.style,
        }),
        isNowCreatedAt: true,
      },
    },
  })

  return (
    <div className="space-y-4">
      {(props.workType === "WORK" || props.workType === null) && (
        <HomeWorkSection
          title={""}
          works={worksResp?.works || []}
          isCropped={props.isCropped}
          isShowProfile={true}
        />
      )}
      {(props.workType === "NOVEL" || props.workType === "COLUMN") && (
        <HomeNovelsWorksSection title={""} works={worksResp?.works || []} />
      )}
      {props.workType === "VIDEO" && (
        <HomeVideosWorksSection
          title={""}
          works={worksResp?.works || []}
          isAutoPlay={true}
        />
      )}
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={perPageCount}
          maxCount={1000}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </div>
  )
}

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
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
