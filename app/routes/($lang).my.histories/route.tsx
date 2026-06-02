import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext, useState } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { toDateTimeText } from "~/utils/to-date-time-text"
import { ResponsivePagination } from "~/components/responsive-pagination"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_HISTORIES, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({})

const PER_PAGE = 20

type WorkActionHistoryListItem = {
  id: string
  actionType: string
  createdAt: number
  summary: string
  detail: string | null
  title: string | null
  ratingLabel: string | null
  workId: string | null
  workUrl: string | null
  thumbnailImageURL: string | null
  isModeratorAction: boolean
}

export default function MyHistories () {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const [page, setPage] = useState(0)
  const [openedId, setOpenedId] = useState<string | null>(null)

  const { data } = useQuery(workActionHistoriesQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: page * PER_PAGE,
      limit: PER_PAGE,
    },
    errorPolicy: "all",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  if (authContext.isLoading || authContext.isNotLoggedIn) {
    return <AppLoadingPage />
  }

  const histories: WorkActionHistoryListItem[] =
    data?.viewer?.workActionHistories ?? []
  const maxCount = data?.viewer?.workActionHistoryCount ?? 0

  return (
    <div className="space-y-4 pb-20">
      {histories.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          {t(
            "まだ作品の操作履歴はありません。",
            "You do not have any work action history yet.",
          )}
        </div>
      ) : (
        histories.map((history) => {
          const isOpened = openedId === history.id

          return (
            <div
              key={history.id}
              className="rounded-lg border border-border/60 bg-card p-4 shadow-xs"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
                  {history.thumbnailImageURL && history.workUrl && (
                    <Link
                      to={history.workUrl}
                      className="block h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted"
                    >
                      <img
                        src={history.thumbnailImageURL}
                        alt={history.title || "work thumbnail"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </Link>
                  )}
                  <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    {toDateTimeText(history.createdAt)}
                  </div>
                  {history.isModeratorAction && (
                    <div>
                      <Badge variant="secondary">
                        {t("モデレーター対応", "Moderator")}
                      </Badge>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {history.title ||
                      t("作品タイトルなし", "Untitled work")}
                    {history.workId
                      ? ` / ${t("作品ID", "Work ID")}: ${history.workId}`
                      : ""}
                  </div>
                  {history.workUrl && (
                    <div className="text-xs text-muted-foreground break-all">
                      {t("作品URL", "Work URL")}: {" "}
                      <Link
                        to={history.workUrl}
                        className="text-primary underline underline-offset-2"
                      >
                        {history.workUrl}
                      </Link>
                    </div>
                  )}
                  <div className="text-sm leading-6 text-foreground">
                    {history.summary}
                  </div>
                </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpenedId(isOpened ? null : history.id)
                  }}
                >
                  {isOpened ? t("閉じる", "Close") : t("詳細", "Details")}
                </Button>
              </div>
              {isOpened && (
                <div className="mt-4 rounded-md bg-muted/40 p-4 text-sm leading-6 text-foreground whitespace-pre-wrap break-words">
                  {history.detail ||
                    t("詳細情報はありません。", "No detail information.")}
                </div>
              )}
            </div>
          )
        })
      )}
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          perPage={PER_PAGE}
          maxCount={maxCount}
          currentPage={page}
          onPageChange={(nextPage: number) => {
            setPage(nextPage)
            setOpenedId(null)
          }}
        />
      </div>
    </div>
  )
}

const workActionHistoriesQuery = graphql(`query ViewerWorkActionHistories($offset: Int!, $limit: Int!) {
  viewer {
    workActionHistoryCount
    workActionHistories(offset: $offset, limit: $limit) {
      id
      actionType
      createdAt
      summary
      detail
      title
      ratingLabel
      workId
      workUrl
      thumbnailImageURL
      isModeratorAction
    }
  }
}`)