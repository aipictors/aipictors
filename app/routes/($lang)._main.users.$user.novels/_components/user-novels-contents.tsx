import { ResponsivePagination } from "@/_components/responsive-pagination"
import { AuthContext } from "@/_contexts/auth-context"
import { ParamsError } from "@/_errors/params-error"
import { UserNovelList } from "@/routes/($lang)._main.users.$user.novels/_components/user-novel-list"
import { useSuspenseQuery } from "@apollo/client/index"
import { useParams } from "@remix-run/react"
import { useContext } from "react"
import { graphql } from "gql.tada"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  workType: "NOVEL" | "COLUMN"
}

export const UserNovelsContents = (props: Props) => {
  const params = useParams()

  if (params.user === undefined) {
    throw new ParamsError()
  }
  const authContext = useContext(AuthContext)

  const { data: workRes } = useSuspenseQuery(worksQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R15", "R18", "R18G"],
        orderBy: "DATE_CREATED",
        workType: props.workType,
      },
    },
  })

  const worksCountResp = useSuspenseQuery(worksCountQuery, {
    skip: authContext.isLoading,
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: ["G", "R15", "R18", "R18G"],
        workType: props.workType,
      },
    },
  })

  const works = workRes?.works ?? []

  const maxCount = worksCountResp.data?.worksCount ?? 0

  console.log("works", maxCount)

  return (
    <>
      <UserNovelList works={works} />
      <div className="mt-1 mb-1">
        <ResponsivePagination
          perPage={32}
          maxCount={maxCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
  )
}

export const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
