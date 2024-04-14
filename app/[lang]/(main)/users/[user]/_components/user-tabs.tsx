import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { useLocation } from "@remix-run/react"
import { useState } from "react"

type Props = {
  params: { user: string }
}

export const UserTabs = (props: Props) => {
  const { pathname } = useLocation()

  const tabValues = [
    "画像",
    "小説",
    "コラム",
    "シリーズ",
    "コレクション",
    "スタンプ",
    "支援応援",
  ]

  const [activeTab, setActiveTab] = useState("画像") // 初期値を設定

  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Tabs defaultValue="画像">
      <TabsList className="border-b">
        {tabValues.map((tabValue) => (
          <TabsTrigger
            key={tabValue}
            value={tabValue}
            onClick={() => handleTabClick(tabValue)}
          >
            {tabValue}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab}>
        {activeTab === "画像" && <div>{activeTab} </div>}
        {activeTab === "小説" && <div>{activeTab}</div>}
        {/* {activeTab === "小説" && <UserAlbumsPage params={props.params} />} */}
        {activeTab === "コラム" && <div>{activeTab}</div>}
        {activeTab === "シリーズ" && <div>{activeTab}</div>}
        {activeTab === "コレクション" && <div>{activeTab}</div>}
        {activeTab === "スタンプ" && <div>{activeTab}</div>}
        {/* {activeTab === "支援応援" && <UserSupportsPage params={props.params} />} */}
        {activeTab === "支援応援" && <div>{activeTab}</div>}
      </TabsContent>
    </Tabs>
  )
}
