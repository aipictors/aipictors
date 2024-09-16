import { useContext, useState } from "react"
import { useQuery } from "@apollo/client/index"
import { AuthContext } from "~/contexts/auth-context"
import { graphql } from "gql.tada"
import { Card, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { PencilIcon } from "lucide-react"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/cn"

export function ModerationReportsContainer({ maxCount }: Props) {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "DONE" | "NO_NEED_ACTION" | "UNHANDLED"
  >("ALL")

  const authContext = useContext(AuthContext)

  const itemsPerPage = 120

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    !authContext.userId
  ) {
    return null
  }

  const {
    data: reports,
    refetch,
    loading,
  } = useQuery(moderationReportsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: itemsPerPage * page,
      limit: itemsPerPage,
      where: {},
    },
  })

  const reportList = reports?.moderationReports ?? []

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    refetch()
  }

  const statusLabel = (
    status: "DONE" | "NO_NEED_ACTION" | "UNHANDLED" | null,
  ) => {
    switch (status) {
      case "DONE":
        return "対応完了"
      case "NO_NEED_ACTION":
        return "対応不要"
      case "UNHANDLED":
        return "未対応"
      default:
        return "未対応"
    }
  }

  const editUrl = (id: string, workType: IntrospectionEnum<"WorkType">) => {
    if (workType === "WORK") {
      return `/posts/${id}/image/edit`
    }
    if (workType === "VIDEO") {
      return `/posts/${id}/animation/edit`
    }
    if (workType === "COLUMN" || workType === "NOVEL") {
      return `/posts/${id}/text/edit`
    }

    return "/"
  }

  const filteredReportList = reportList.filter((report) => {
    if (statusFilter === "ALL") return true
    return report.status === statusFilter
  })

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex space-x-4">
        <Button
          onClick={() => setStatusFilter("ALL")}
          variant={"secondary"}
          className={cn(
            "px-4 py-2 transition-colors duration-200",
            statusFilter === "ALL" ? "opacity-50" : "",
          )}
        >
          すべて
        </Button>
        <Button
          onClick={() => setStatusFilter("DONE")}
          variant={"secondary"}
          className={cn(
            "px-4 py-2 transition-colors duration-200",
            statusFilter === "DONE" ? "opacity-50" : "",
          )}
        >
          対応完了
        </Button>
        <Button
          onClick={() => setStatusFilter("NO_NEED_ACTION")}
          variant={"secondary"}
          className={cn(
            "px-4 py-2 transition-colors duration-200",
            statusFilter === "NO_NEED_ACTION" ? "opacity-50" : "",
          )}
        >
          対応不要
        </Button>
        <Button
          onClick={() => setStatusFilter("UNHANDLED")}
          variant={"secondary"}
          className={cn(
            "px-4 py-2 transition-colors duration-200",
            statusFilter === "UNHANDLED" ? "opacity-50" : "",
          )}
        >
          未対応
        </Button>
      </div>
      {filteredReportList.map(
        (report) =>
          report && (
            <Card key={report.id.toString()} className="rounded-none">
              <CardContent className="flex flex-col items-center space-x-2 space-y-2 p-4 md:flex-row">
                {report.work && (
                  <div className="h-32 w-32">
                    <CroppedWorkSquare
                      workId={report.work?.id}
                      subWorksCount={report.work.subWorksCount}
                      imageUrl={report.work.smallThumbnailImageURL}
                      thumbnailImagePosition={
                        report.work.thumbnailImagePosition ?? 0
                      }
                      size="md"
                      imageWidth={report.work.smallThumbnailImageWidth}
                      imageHeight={report.work.smallThumbnailImageHeight}
                    />
                  </div>
                )}
                <div className="flex w-full flex-col space-y-2">
                  <span className="font-bold">「{report.work?.title}」</span>
                  <p className="mb-2">{report.reportMessage}</p>
                  {report.customMessage && (
                    <p className="text-sm italic">
                      追加メッセージ: {report.customMessage}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <Badge
                      variant={report.isRead ? "secondary" : "destructive"}
                    >
                      {report.isRead ? "既読" : "未読"}
                    </Badge>
                    <Badge
                      variant={
                        report.status === "NO_NEED_ACTION" ||
                        report.status === "DONE"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {statusLabel(report.status)}
                    </Badge>
                  </div>
                  {report.responseMessage && (
                    <p className="text-muted-foreground text-sm">
                      {"あなたの返信"}:「{report.responseMessage}」
                    </p>
                  )}
                </div>
                {report.work && (
                  <Link
                    className="w-full md:w-auto"
                    to={editUrl(
                      report.work?.id,
                      report.work?.type as
                        | "COLUMN"
                        | "NOVEL"
                        | "VIDEO"
                        | "WORK",
                    )}
                  >
                    <Button
                      className="w-full space-x-2"
                      aria-label={"編集"}
                      variant="secondary"
                    >
                      <PencilIcon width={16} />
                      <p>編集</p>
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ),
      )}
    </div>
  )
}

const ModerationReportFragment = graphql(`
  fragment ModerationReportItem on ModerationReportNode @_unmask {
    id
    createdAt
    work {
      id
      title
      user {
        id
        name
      }
      smallThumbnailImageURL
      subWorksCount
      thumbnailImagePosition
      smallThumbnailImageWidth
      smallThumbnailImageHeight
      type
    }
    customMessage
    isRead
    responseMessage
    status
    reportMessage
  }
`)

const moderationReportsQuery = graphql(
  `
  query ModerationReports($offset: Int!, $limit: Int!, $where: ModerationReportsWhereInput!) {
    moderationReports(offset: $offset, limit: $limit, where: $where) {
      ...ModerationReportItem
    }
  }
`,
  [ModerationReportFragment],
)

type Props = {
  maxCount: number
}
