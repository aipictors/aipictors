import { AuthContext } from "~/contexts/auth-context"
import { HomeWorkSection } from "~/routes/($lang)._main._index/components/home-work-section"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { ResponsivePagination } from "~/components/responsive-pagination"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  isSensitive?: boolean
  page: number
  setPage: (page: number) => void
  workType: IntrospectionEnum<"WorkType"> | null
}

/**
 * 新作一覧
 */
export const HomeNewWorksTagSection = (props: Props) => {
  const appContext = useContext(AuthContext)

  const { data: worksResp } = useSuspenseQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G"],
        orderBy: "DATE_CREATED",
        ...(props.workType && {
          workType: props.workType,
        }),
      },
    },
  })

  return (
    <div className="space-y-4">
      <HomeWorkSection
        title={""}
        works={worksResp?.works || []}
        isCropped={false}
      />
      <ResponsivePagination
        perPage={32}
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
