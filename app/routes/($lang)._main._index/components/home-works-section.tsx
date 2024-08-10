import { AuthContext } from "~/contexts/auth-context"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { ResponsivePagination } from "~/components/responsive-pagination"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeNovelsWorksSection } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import { HomeVideosWorksSection } from "~/routes/($lang)._main._index/components/home-video-works-section"

type Props = {
  isSensitive?: boolean
  page: number
  setPage: (page: number) => void
  workType: IntrospectionEnum<"WorkType"> | null
  isPromptPublic: boolean | null
  sortType: IntrospectionEnum<"WorkOrderBy"> | null
}

/**
 * トップ画面ホーム作品一覧
 */
export const HomeWorksSection = (props: Props) => {
  const appContext = useContext(AuthContext)

  const perPageCount = props.workType === "VIDEO" ? 8 : 32

  const { data: worksResp } = useSuspenseQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: props.page * perPageCount,
      limit: perPageCount,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G"],
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
          isCropped={false}
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
      <ResponsivePagination
        perPage={perPageCount}
        maxCount={1000}
        currentPage={props.page}
        onPageChange={(page: number) => {
          props.setPage(page)
        }}
      />
    </div>
  )
}
const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
