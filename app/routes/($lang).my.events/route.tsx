import { useMutation, useQuery } from "@apollo/client/index"
import { Link } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { useTranslation } from "~/hooks/use-translation"
import { useContext } from "react"
import { toast } from "sonner"

type UserEventVisibilityType = "DRAFT" | "PUBLIC" | "PRIVATE"

type MyEventsQueryData = {
  userEvents: Array<{
    id: string
    slug: string
    title: string
    thumbnailImageUrl: string | null
    headerImageUrl: string | null
    mainTag: string
    status: string
    visibilityType: UserEventVisibilityType
    entryCount: number
    participantCount: number
    rankingEnabled: boolean
  }>
}

type MyEventsQueryVars = {
  offset: number
  limit: number
  where: {
    onlyMine: boolean
    sort: string
  }
}

type UpdateUserEventStatusMutationData = {
  updateUserEventStatus: {
    id: string
    slug: string
    status: string
  } | null
}

type UpdateUserEventStatusMutationVars = {
  input: {
    slug: string
    visibilityType: UserEventVisibilityType
    forceEnd: boolean
  }
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY, { title: "マイイベント" }, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({})

export default function MyEventsRoute () {
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  const { data, refetch } = useQuery<MyEventsQueryData, MyEventsQueryVars>(myEventsQuery as any, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 50,
      where: {
        onlyMine: true,
        sort: "NEWEST",
      },
    },
  })

  const [updateStatus] = useMutation<
    UpdateUserEventStatusMutationData,
    UpdateUserEventStatusMutationVars
  >(updateUserEventStatusMutation as any)

  if (authContext.isLoading) {
    return null
  }

  if (authContext.isNotLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("ログインが必要です", "Login required")}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const events = data?.userEvents ?? []

  const resolveThumbnailImageUrl = (event: MyEventsQueryData["userEvents"][number]) => {
    return event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png"
  }

  const onStatusChange = async (slug: string, visibilityType: UserEventVisibilityType, forceEnd = false) => {
    try {
      await updateStatus({
        variables: {
          input: {
            slug,
            visibilityType,
            forceEnd,
          },
        },
      })
      toast(t("イベント状態を更新しました", "Event status updated"))
      refetch()
    } catch {
      toast(t("状態更新に失敗しました", "Failed to update event status"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-bold text-2xl">{t("マイイベント", "My events")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("作成したイベントの公開状態や告知内容を確認できます。", "Manage the visibility and announcement copy of your events.")}
          </p>
        </div>
        <Button asChild>
          <Link to="/events/new">{t("新規作成", "Create new")}</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border bg-muted/30 sm:h-24 sm:w-24">
                <img
                  alt={event.title}
                  className="h-full w-full object-cover"
                  src={resolveThumbnailImageUrl(event)}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span className="break-words">{event.title}</span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs">{event.status}</span>
                </CardTitle>
                <div className="text-muted-foreground text-sm">#{event.mainTag}</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span>{t("作品", "Entries")}: {event.entryCount}</span>
                  <span>{t("参加者", "Participants")}: {event.participantCount}</span>
                  <span>{event.rankingEnabled ? t("ランキングあり", "Ranking enabled") : t("ランキングなし", "No ranking")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary"><Link to={`/events/${event.slug}`}>{t("詳細", "Open")}</Link></Button>
                  <Button asChild variant="secondary"><Link to={`/events/${event.slug}/edit`}>{t("編集", "Edit")}</Link></Button>
                  <Button variant="secondary" onClick={() => onStatusChange(event.slug, event.visibilityType === "PUBLIC" ? "DRAFT" : "PUBLIC")}>{event.visibilityType === "PUBLIC" ? t("下書きに戻す", "Move to draft") : t("公開する", "Publish")}</Button>
                  <Button variant="secondary" onClick={() => onStatusChange(event.slug, "PRIVATE")}>{t("非公開", "Make private")}</Button>
                  <Button variant="secondary" onClick={() => onStatusChange(event.slug, "PUBLIC", true)}>{t("終了する", "End event")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {events.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              {t("まだ作成したイベントがありません。最初の企画を作成しましょう。", "You have not created any events yet.")}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

const myEventsQuery = graphql(
  `query MyUserEvents($offset: Int!, $limit: Int!, $where: UserEventsWhereInput) {
    userEvents(offset: $offset, limit: $limit, where: $where) {
      id
      slug
      title
      thumbnailImageUrl
      headerImageUrl
      mainTag
      status
      visibilityType
      entryCount
      participantCount
      rankingEnabled
    }
  }`,
)

const updateUserEventStatusMutation = graphql(
  `mutation UpdateUserEventStatus($input: UpdateUserEventStatusInput!) {
    updateUserEventStatus(input: $input) {
      id
      slug
      status
    }
  }`,
)
