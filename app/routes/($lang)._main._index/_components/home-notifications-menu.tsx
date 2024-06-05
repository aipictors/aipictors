import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { Button } from "@/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import type { NotificationType } from "@/_graphql/__generated__/graphql"
import { HomeNotificationCommentsTabs } from "@/routes/($lang)._main._index/_components/home-notifications-comments-tabs"
import { HomeNotificationsContents } from "@/routes/($lang)._main._index/_components/home-notifications-contents"
import { BellIcon } from "lucide-react"
import { Suspense, useState } from "react"

/**
 * ヘッダーのお知らせメニュー
 */
export const HomeNotificationsMenu = () => {
  const tabValues: NotificationType[] = [
    "LIKED_WORK",
    "WORK_COMMENT",
    "WORK_AWARD",
    "FOLLOW",
  ]

  const tabLabel = ["いいね", "コメント", "ランキング", "フォロー"]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] = useState<NotificationType>(defaultTab)

  const handleTabClick = (value: string) => {
    setActiveTab(value as NotificationType)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"} size={"icon"} aria-label={"通知"}>
          <BellIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="w-96">
          <div className="p-2 text-center font-bold opacity-80">{"通知"}</div>
          <Tabs defaultValue={defaultTab}>
            <div className="border-b">
              <TabsList className="mx-0 mb-1 md:mx-4">
                {tabValues.map((tabValue) => (
                  <TabsTrigger
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
          <div className="relative h-96">
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
          <a href="/notifications">通知履歴</a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
