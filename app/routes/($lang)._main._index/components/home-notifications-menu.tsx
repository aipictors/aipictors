import { AppLoadingPage } from "~/components/app/app-loading-page"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeNotificationCommentsTabs } from "~/routes/($lang)._main._index/components/home-notifications-comments-tabs"
import { HomeNotificationsContents } from "~/routes/($lang)._main._index/components/home-notifications-contents"
import { Link } from "react-router";
import {
  AwardIcon,
  BellIcon,
  HeartIcon,
  MailIcon,
  MessageCircle,
  UserRoundCheck,
} from "lucide-react"
import { Suspense, useState } from "react"
import { HomeMessagesContents } from "~/routes/($lang)._main._index/components/home-messages-contents"
import type { CheckedNotificationTimesFragment } from "~/routes/($lang)._main._index/components/home-header"
import { graphql, type FragmentOf } from "gql.tada"
import { WorkAwardNotificationFragment } from "~/routes/($lang)._main._index/components/home-notifications-content-award-item"
import { LikedWorkNotificationFragment } from "~/routes/($lang)._main._index/components/home-notifications-content-liked-item"
import { FollowNotificationFragment } from "~/routes/($lang)._main._index/components/home-notifications-content-followed-item"
import {
  MessageListItemFragment,
  MessageThreadRecipientFragment,
} from "~/routes/($lang)._main.support.chat/components/support-message-list"
import { WorkCommentNotificationFragment } from "~/routes/($lang)._main._index/components/home-notifications-content-commented-item"
import { useQuery } from "@apollo/client/index"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isExistedNewNotification: boolean
  setIsExistedNewNotificationState: (isExistedNewNotification: boolean) => void
  checkedNotificationTimes: FragmentOf<
    typeof CheckedNotificationTimesFragment
  >[]
}

/**
 * ヘッダーのお知らせメニュー
 */
export function HomeNotificationsMenu(props: Props) {
  // "MESSAGE"タブを追加
  const tabValues: (IntrospectionEnum<"NotificationType"> | "MESSAGE")[] = [
    "LIKED_WORK",
    "WORK_COMMENT",
    "WORK_AWARD",
    "FOLLOW",
    "MESSAGE",
  ]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] = useState<
    IntrospectionEnum<"NotificationType"> | "MESSAGE"
  >(defaultTab)

  const handleTabClick = (value: string) => {
    setActiveTab(value as IntrospectionEnum<"NotificationType"> | "MESSAGE")
  }

  // 各通知タイプごとにチェックされた通知時間を取得し、通知の新しさを判定する関数
  const isNewNotification = (
    notificationType: string,
    createdAt: number,
  ): boolean => {
    const checkedTimeForType = props.checkedNotificationTimes.find(
      (item) => item.type === notificationType,
    )?.checkedTime

    return createdAt > (checkedTimeForType ?? 0)
  }

  const likeNotificationData = useQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 1,
      where: {
        type: "LIKED_WORK",
      },
    },
  })

  const commentNotificationData = useQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 1,
      where: {
        type: "WORK_COMMENT",
      },
    },
  })

  const awardNotificationData = useQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 1,
      where: {
        type: "WORK_AWARD",
      },
    },
  })

  const followNotificationData = useQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 1,
      where: {
        type: "FOLLOW",
      },
    },
  })

  const messageNotificationData = useQuery(messagesQuery, {
    variables: {
      offset: 0,
      limit: 1,
    },
  })

  // 安全にデータにアクセスする
  const likeNotification = likeNotificationData.data?.viewer
    ?.notifications?.[0] as
    | FragmentOf<typeof LikedWorkNotificationFragment>
    | undefined
  const commentNotification = commentNotificationData.data?.viewer
    ?.notifications?.[0] as
    | FragmentOf<typeof WorkCommentNotificationFragment>
    | undefined
  const awardNotification = awardNotificationData.data?.viewer
    ?.notifications?.[0] as
    | FragmentOf<typeof WorkAwardNotificationFragment>
    | undefined
  const followNotification = followNotificationData.data?.viewer
    ?.notifications?.[0] as
    | FragmentOf<typeof FollowNotificationFragment>
    | undefined
  const messageNotification =
    messageNotificationData.data?.viewer?.supportMessages?.[0]

  // 各通知が新しいかどうかを判定する
  const isNewLikeNotification = likeNotification
    ? isNewNotification("liked", likeNotification.createdAt)
    : false
  const isNewCommentNotification = commentNotification
    ? isNewNotification("comment", commentNotification.createdAt)
    : false
  const isNewAwardNotification = awardNotification
    ? isNewNotification("award", awardNotification.createdAt)
    : false
  const isNewFollowNotification = followNotification
    ? isNewNotification("followed", followNotification.createdAt)
    : false
  const isNewMessageNotification = messageNotification
    ? isNewNotification("message", messageNotification.createdAt)
    : false

  const t = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={"icon"}
          variant={"ghost"}
          aria-label={"通知"}
          className="relative"
          onClick={
            props.isExistedNewNotification
              ? () => {
                  props.setIsExistedNewNotificationState(false)
                }
              : undefined
          }
        >
          <BellIcon className="w-16" />
          {props.isExistedNewNotification && (
            <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex w-96 flex-col">
          <Tabs value={activeTab} onValueChange={handleTabClick}>
            <div className="border-b">
              <TabsList className="flex justify-center">
                {tabValues.map((tabValue) => (
                  <TabsTrigger
                    className="w-full"
                    key={tabValue}
                    value={tabValue}
                  >
                    {tabValue === "LIKED_WORK" && (
                      <div className="relative">
                        <HeartIcon className="w-4" />
                        {isNewLikeNotification && (
                          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                    {tabValue === "WORK_COMMENT" && (
                      <div className="relative">
                        <MessageCircle className="w-4" />
                        {isNewCommentNotification && (
                          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                    {tabValue === "WORK_AWARD" && (
                      <div className="relative">
                        <AwardIcon className="w-4" />
                        {isNewAwardNotification && (
                          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                    {tabValue === "FOLLOW" && (
                      <div className="relative">
                        <UserRoundCheck className="w-4" />
                        {isNewFollowNotification && (
                          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                    {tabValue === "MESSAGE" && (
                      <div className="relative">
                        <MailIcon className="w-4" />
                        {isNewMessageNotification && (
                          <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                        )}
                      </div>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
          <div className="relative m-0 h-96">
            <Suspense
              fallback={
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform">
                  <AppLoadingPage />
                </div>
              }
            >
              {activeTab !== "WORK_COMMENT" && activeTab !== "MESSAGE" && (
                <HomeNotificationsContents type={activeTab} />
              )}
              {activeTab === "WORK_COMMENT" && <HomeNotificationCommentsTabs />}
              {activeTab === "MESSAGE" && <HomeMessagesContents />}
            </Suspense>
          </div>
        </div>
        {/* フッター部分 */}
        <div className="border-t pt-2 pb-2 pl-4">
          <Link to="/notifications">{t("通知履歴", "History")}</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const viewerNotificationsQuery = graphql(
  `query ViewerNotifications($offset: Int!, $limit: Int!, $where: NotificationsWhereInput) {
    viewer {
      id
      notifications(offset: $offset, limit: $limit, where: $where) {
        ... on LikedWorkNotificationNode {
          ...LikedWorkNotification
        }
        ... on WorkAwardNotificationNode {
          ...WorkAwardNotification
        }
        ... on FollowNotificationNode {
          ...FollowNotification
        }
        ... on WorkCommentNotificationNode {
          ...WorkCommentNotification
        }
      }
    }
  }`,
  [
    LikedWorkNotificationFragment,
    WorkAwardNotificationFragment,
    FollowNotificationFragment,
    WorkCommentNotificationFragment,
  ],
)

const messagesQuery = graphql(
  `query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      id
      supportMessages(offset: $offset, limit: $limit) {
        id
        ...MessageListItem
      }
    }
  }`,
  [MessageThreadRecipientFragment, MessageListItemFragment],
)
