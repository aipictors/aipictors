import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"

type Props = {
  page: number
  maxCount: number
  setPage: (page: number) => void
}

/**
 * 運営からのお知らせ一覧コンテナ
 */
export function ModerationReportsContainer(props: Props) {
  const authContext = useContext(AuthContext)

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }
  const { data: reports, refetch } = useQuery(moderationReportsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 120 * props.page,
      limit: 120,
      where: {},
    },
  })

  const reportList = reports?.moderationReports ?? []

  return (
    <>
      <p>{"メンテナンス中です。"}</p>
      <div>
        {reportList.map((report) => (
          <div key={report.id.toString()}>{report.reportMessage}</div>
        ))}
      </div>
    </>
  )
}

export const ModerationReportFragment = graphql(
  `fragment ModerationReportItem on ModerationReportNode @_unmask {
    id
    createdAt
    work {
      id
      title
      user {
        id
        name
      }
    }
    customMessage
    isRead
    responseMessage
    status
    reportMessage
  }`,
)

const moderationReportsQuery = graphql(
  `query ModerationReports($offset: Int!, $limit: Int!, $where: ModerationReportsWhereInput!) {
    moderationReports(offset: $offset, limit: $limit, where: $where) {
      ...ModerationReportItem
    }
  }`,
  [ModerationReportFragment],
)
