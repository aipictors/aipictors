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
import { Link } from "@remix-run/react"
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

/**
 * ヘッダーのお知らせメニュー
 */
export function HomeNotificationsMenu() {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"} aria-label={"通知"}>
          <BellIcon className="w-16" />
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
                    {tabValue === "LIKED_WORK" && <HeartIcon className="w-4" />}
                    {tabValue === "WORK_COMMENT" && (
                      <MessageCircle className="w-4" />
                    )}
                    {tabValue === "WORK_AWARD" && <AwardIcon className="w-4" />}
                    {tabValue === "FOLLOW" && (
                      <UserRoundCheck className="w-4" />
                    )}
                    {tabValue === "MESSAGE" && <MailIcon className="w-4" />}
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
          <Link to="/notifications">通知履歴</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
