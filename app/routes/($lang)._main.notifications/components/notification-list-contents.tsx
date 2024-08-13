import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ResponsivePagination } from "~/components/responsive-pagination"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { NotificationListItems } from "~/routes/($lang)._main.notifications/components/notification-list-items"
import { NotificationListSetting } from "~/routes/($lang)._main.notifications/components/notification-list-settings"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { Suspense, useState } from "react"

export const NotificationListContents = () => {
  const [notifyType, setNotifyType] =
    useState<IntrospectionEnum<"NotificationType"> | null>("LIKED_WORK")

  const [page, setPage] = useState(0)

  const { data: notificationsCount } = useSuspenseQuery(ViewerQuery, {
    variables: {
      where: {
        type: notifyType !== null ? notifyType : undefined,
      },
      orderBy: "CREATED_AT",
    },
    fetchPolicy: "cache-first",
  })

  return (
    <>
      <NotificationListSetting
        notificationType={notifyType}
        setNotificationType={setNotifyType}
      />
      <Suspense fallback={<AppLoadingPage />}>
        <NotificationListItems type={notifyType} page={page} />
      </Suspense>
      <div className="mt-1 mb-1">
        <ResponsivePagination
          perPage={160}
          maxCount={notificationsCount.viewer?.notificationsCount ?? 0}
          currentPage={page}
          onPageChange={(page: number) => {
            setPage(page)
          }}
        />
      </div>
    </>
  )
}

const ViewerQuery = graphql(
  `query ViewerNotifications($where: NotificationsWhereInput) {
    viewer {
      id
      notificationsCount(where: $where)
    }
  }`,
)
