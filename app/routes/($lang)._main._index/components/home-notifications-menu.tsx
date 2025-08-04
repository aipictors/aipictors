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
import { HomeMessagesContents } from "~/routes/($lang)._main._index/components/home-messages-contents"
import { Link } from "@remix-run/react"
import {
  AwardIcon,
  BellIcon,
  HeartIcon,
  MailIcon,
  MessageCircle,
  UserRoundCheck,
} from "lucide-react"
import { Suspense, useState, useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
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

// ---------- 型 ----------

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
  const authContext = useContext(AuthContext)

  // "MESSAGE" タブを追加
  const tabValues: (IntrospectionEnum<"NotificationType"> | "MESSAGE")[] = [
    "LIKED_WORK",
    "WORK_COMMENT",
    "WORK_AWARD",
    "FOLLOW",
    "MESSAGE",
  ]
  const defaultTab = tabValues[0]

  // ▼ どのタブがアクティブか
  const [activeTab, setActiveTab] = useState<
    IntrospectionEnum<"NotificationType"> | "MESSAGE"
  >(defaultTab)

  // ▼ ドロップダウンを制御モードに
  const [open, setOpen] = useState(false)

  const handleTabClick = (value: string) => {
    setActiveTab(value as IntrospectionEnum<"NotificationType"> | "MESSAGE")
  }

  // ---------- 新規判定ユーティリティ ----------
  const isNewNotification = (notificationType: string, createdAt: number) => {
    const checkedTimeForType = props.checkedNotificationTimes.find(
      (t) => t.type === notificationType,
    )?.checkedTime

    return createdAt > (checkedTimeForType ?? 0)
  }

  // ---------- GraphQL: 最新 1 件を取得して新規判定 ----------
  const likeNotificationData = useQuery(viewerNotificationsQuery, {
    variables: { offset: 0, limit: 1, where: { type: "LIKED_WORK" } },
    skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
    errorPolicy: "all",
    fetchPolicy: "cache-first",
  })
  const commentNotificationData = useQuery(viewerNotificationsQuery, {
    variables: { offset: 0, limit: 1, where: { type: "WORK_COMMENT" } },
    skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
    errorPolicy: "all",
    fetchPolicy: "cache-first",
  })
  const awardNotificationData = useQuery(viewerNotificationsQuery, {
    variables: { offset: 0, limit: 1, where: { type: "WORK_AWARD" } },
    skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
    errorPolicy: "all",
    fetchPolicy: "cache-first",
  })
  const followNotificationData = useQuery(viewerNotificationsQuery, {
    variables: { offset: 0, limit: 1, where: { type: "FOLLOW" } },
    skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
    errorPolicy: "all",
    fetchPolicy: "cache-first",
  })
  const messageNotificationData = useQuery(messagesQuery, {
    variables: { offset: 0, limit: 1 },
    skip: !authContext.isLoggedIn || authContext.isLoading, // ログイン確定かつloading終了している場合のみ実行
    errorPolicy: "all",
    fetchPolicy: "cache-first",
  })

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

  // デバッグ用ログ
  console.log("🔔 HomeNotificationsMenu render:", {
    isExistedNewNotification: props.isExistedNewNotification,
    authContext: {
      isLoggedIn: authContext.isLoggedIn,
      isNotLoggedIn: authContext.isNotLoggedIn,
      isLoading: authContext.isLoading,
    },
    queries: {
      likeData: !!likeNotificationData.data,
      likeLoading: likeNotificationData.loading,
      likeError: !!likeNotificationData.error,
      commentData: !!commentNotificationData.data,
      commentLoading: commentNotificationData.loading,
      commentError: !!commentNotificationData.error,
      awardData: !!awardNotificationData.data,
      awardLoading: awardNotificationData.loading,
      followData: !!followNotificationData.data,
      followLoading: followNotificationData.loading,
      messageData: !!messageNotificationData.data,
      messageLoading: messageNotificationData.loading,
    },
    notifications: {
      like: !!likeNotification,
      comment: !!commentNotification,
      award: !!awardNotification,
      follow: !!followNotification,
      message: !!messageNotification,
    },
    newNotifications: {
      isNewLike: isNewLikeNotification,
      isNewComment: isNewCommentNotification,
      isNewAward: isNewAwardNotification,
      isNewFollow: isNewFollowNotification,
      isNewMessage: isNewMessageNotification,
    },
  })

  // ログインしていない場合またはまだ認証状態が確定していない場合は何も表示しない
  if (!authContext.isLoggedIn) {
    return null
  }

  // ---------- JSX ----------
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="通知"
          className="relative"
          onClick={
            props.isExistedNewNotification
              ? () => props.setIsExistedNewNotificationState(false)
              : undefined
          }
        >
          <BellIcon className="w-16" />
          {props.isExistedNewNotification && (
            <div className="absolute top-0 right-0 size-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {/* ▼ ヘッダー部分（タブ） ▼ */}
        <div className="flex w-96 flex-col">
          <Tabs value={activeTab} onValueChange={handleTabClick}>
            <div className="border-b">
              <TabsList className="flex justify-center">
                {tabValues.map((tabValue) => (
                  <TabsTrigger
                    key={tabValue}
                    value={tabValue}
                    className="w-full"
                  >
                    {tabValue === "LIKED_WORK" && (
                      <IconWithDot
                        icon={<HeartIcon className="w-4" />}
                        showDot={isNewLikeNotification}
                      />
                    )}
                    {tabValue === "WORK_COMMENT" && (
                      <IconWithDot
                        icon={<MessageCircle className="w-4" />}
                        showDot={isNewCommentNotification}
                      />
                    )}
                    {tabValue === "WORK_AWARD" && (
                      <IconWithDot
                        icon={<AwardIcon className="w-4" />}
                        showDot={isNewAwardNotification}
                      />
                    )}
                    {tabValue === "FOLLOW" && (
                      <IconWithDot
                        icon={<UserRoundCheck className="w-4" />}
                        showDot={isNewFollowNotification}
                      />
                    )}
                    {tabValue === "MESSAGE" && (
                      <IconWithDot
                        icon={<MailIcon className="w-4" />}
                        showDot={isNewMessageNotification}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>

          {/* ▼ コンテンツ ▼ */}
          <div className="relative m-0 h-64 md:h-96">
            <Suspense
              fallback={
                <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
                  <AppLoadingPage />
                </div>
              }
            >
              {activeTab !== "WORK_COMMENT" && activeTab !== "MESSAGE" && (
                <HomeNotificationsContents
                  type={activeTab as IntrospectionEnum<"NotificationType">}
                  onItemSelect={() => setOpen(false)}
                />
              )}
              {activeTab === "WORK_COMMENT" && (
                <HomeNotificationCommentsTabs onClick={() => setOpen(false)} />
              )}
              {activeTab === "MESSAGE" && (
                <HomeMessagesContents onClick={() => setOpen(false)} />
              )}
            </Suspense>
          </div>
        </div>

        {/* ▼ フッター ▼ */}
        <div className="border-t pt-2 pb-2 pl-4">
          <Link to="/notifications" onClick={() => setOpen(false)}>
            {t("通知履歴", "History")}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ▼ 通知ドット付きアイコンを共通化
function IconWithDot({
  icon,
  showDot,
}: {
  icon: React.ReactNode
  showDot: boolean
}) {
  return (
    <div className="relative">
      {icon}
      {showDot && (
        <div className="absolute top-0 right-0 size-2 rounded-full bg-red-500" />
      )}
    </div>
  )
}

// ---------- GraphQL ----------
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
