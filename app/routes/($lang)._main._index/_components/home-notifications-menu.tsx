import { Button } from "@/_components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { BellIcon } from "lucide-react"
import { useState } from "react"

/**
 * ヘッダーのお知らせメニュー
 */
export const HomeNotificationsMenu = () => {
  const tabValues = [
    "LIKED_WORK",
    "WORK_COMMENT",
    "WORK_AWARD",
    "COMMENT_REPLY",
    "FOLLOW",
  ]

  const tabLabel = ["いいね", "コメント", "ランキング", "返信", "フォロー"]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] = useState(defaultTab)

  /*
  const { data: notifications } = useQuery(viewerNotificationsQuery, {
    variables: {
      offset: 0,
      limit: 40,
      where: {
        type: activeTab as NotificationType,
      },
    },
    fetchPolicy: "cache-first",
  })
  */

  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"secondary"} size={"icon"} aria-label={"通知"}>
          <BellIcon className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="p-2 text-center font-bold opacity-80">{"通知"}</div>
        <Tabs defaultValue={defaultTab}>
          <div className="border-b">
            <TabsList className="mx-4">
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
          {/* notifications?.viewer && (
            <TabsContent className="max-w-40" value={activeTab}>
              <div className="flex h-64 w-full flex-col">
                <ScrollArea className="w-full">
                  {activeTab === "LIKED_WORK" &&
                    notifications.viewer.notifications.map((notification) => {
                      const likedWorkNotification =
                        notification as LikedWorkNotificationNode
                      return (
                        <HeaderNotificationItem
                          key={likedWorkNotification.id}
                          text={likedWorkNotification.work.title}
                          link={`/notification/${likedWorkNotification.id}`}
                        />
                      )
                    })}
                </ScrollArea>
              </div>
            </TabsContent>
          ) */}
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
