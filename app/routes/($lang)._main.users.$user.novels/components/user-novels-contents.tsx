import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import { ParamsError } from "~/errors/params-error"
import {
  UserNovelList,
  UserNovelListItemFragment,
} from "~/routes/($lang)._main.users.$user.novels/components/user-novel-list"
import { useQuery } from "@apollo/client/index"
import { useParams } from "@remix-run/react"
import { useContext } from "react"
import { graphql } from "gql.tada"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  workType: "NOVEL" | "COLUMN"
  isSensitive?: boolean
}

export function UserNovelsContents(props: Props) {
  const params = useParams()

  if (params.user === undefined) {
    throw ParamsError()
  }
  const authContext = useContext(AuthContext)

  const { data: workRes } = useQuery(worksQuery, {
    variables: {
      offset: props.page * 32,
      limit: 32,
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        orderBy: "DATE_CREATED",
        workType: props.workType,
      },
    },
  })

  const worksCountResp = useQuery(worksCountQuery, {
    variables: {
      where: {
        userId: props.userId,
        isNowCreatedAt: true,
        ratings: props.isSensitive ? ["R18", "R18G"] : ["G", "R15"],
        isSensitive: props.isSensitive,
        workType: props.workType,
      },
    },
  })

  const works = workRes?.works ?? []

  const maxCount = worksCountResp.data?.worksCount ?? 0

  return (
    <>
      <UserNovelList works={works} />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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

const worksCountQuery = graphql(
  `query WorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...UserNovelListItem
    }
  }`,
  [UserNovelListItemFragment],
)
