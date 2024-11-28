import { ScrollArea } from "~/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeNotificationCommentsContents } from "~/routes/($lang)._main._index/components/home-notifications-comments-contents"
import { useState } from "react"
import { useTranslation } from "~/hooks/use-translation"

/**
 * ヘッダーのお知らせメニューのコメントタブ
 */
export function HomeNotificationCommentsTabs() {
  const tabValues: IntrospectionEnum<"NotificationType">[] = [
    "WORK_COMMENT",
    "COMMENT_REPLY",
  ]

  const t = useTranslation()

  const tabLabel = [t("コメント", "Comment"), t("返信", "Reply")]

  const defaultTab = tabValues[0]

  const [activeTab, setActiveTab] =
    useState<IntrospectionEnum<"NotificationType">>(defaultTab)

  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    setActiveTab(value as IntrospectionEnum<"NotificationType">)
  }

  return (
    <>
      <ScrollArea className="relative h-64 overflow-y-auto md:h-96">
        <Tabs className="sticky top-0 z-10 bg-card" defaultValue={defaultTab}>
          <div className="border-b">
            <TabsList className="mx-0 w-full">
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
        <HomeNotificationCommentsContents type={activeTab} />
      </ScrollArea>
    </>
  )
}
