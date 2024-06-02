import { ScrollArea } from "@/_components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import type { NotificationType } from "@/_graphql/__generated__/graphql"
import { HomeNotificationCommentsContents } from "@/routes/($lang)._main._index/_components/home-notifications-comments-contents"
import { useState } from "react"

/**
 * ヘッダーのお知らせメニューのコメントタブ
 */
export const HomeNotificationCommentsTabs = () => {
  const tabValues: NotificationType[] = ["WORK_COMMENT", "COMMENT_REPLY"]

  const tabLabel = ["コメント", "返信"]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] = useState<NotificationType>(defaultTab)

  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    setActiveTab(value as NotificationType)
  }

  return (
    <>
      <Tabs className="pt-1" defaultValue={defaultTab}>
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
      <ScrollArea className="h-96 overflow-y-auto">
        <HomeNotificationCommentsContents type={activeTab} />
      </ScrollArea>
    </>
  )
}
