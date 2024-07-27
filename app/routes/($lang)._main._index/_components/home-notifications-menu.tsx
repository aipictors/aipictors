import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { Button } from "@/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { HomeNotificationCommentsTabs } from "@/routes/($lang)._main._index/_components/home-notifications-comments-tabs"
import { HomeNotificationsContents } from "@/routes/($lang)._main._index/_components/home-notifications-contents"
import { Link } from "@remix-run/react"
import { BellIcon } from "lucide-react"
import { Suspense, useState } from "react"

/**
 * ヘッダーのお知らせメニュー
 */
export const HomeNotificationsMenu = () => {
  const tabValues: IntrospectionEnum<"NotificationType">[] = [
    "LIKED_WORK",
    "WORK_COMMENT",
    "WORK_AWARD",
    "FOLLOW",
  ]

  const tabLabel = ["いいね", "コメント", "ランキング", "フォロー"]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] =
    useState<IntrospectionEnum<"NotificationType">>(defaultTab)

  const handleTabClick = (value: string) => {
    setActiveTab(value as IntrospectionEnum<"NotificationType">)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"} size={"icon"} aria-label={"通知"}>
          <BellIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex w-96 flex-col">
          <Tabs defaultValue={defaultTab}>
            <div className="border-b">
              <TabsList className="flex justify-center">
                {tabValues.map((tabValue) => (
                  <TabsTrigger
                    className="w-full"
                    key={tabValue}
                    value={tabValue}
                    onClick={() => handleTabClick(tabValue)}
                  >
                    {tabLabel[tabValues.indexOf(tabValue)]}
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
              {activeTab !== "WORK_COMMENT" && (
                <HomeNotificationsContents type={activeTab} />
              )}
              {activeTab === "WORK_COMMENT" && <HomeNotificationCommentsTabs />}
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
