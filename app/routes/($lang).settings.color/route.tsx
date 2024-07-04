import { AppPageCenter } from "@/_components/app/app-page-center"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { Button } from "@/_components/ui/button"
import { Card } from "@/_components/ui/card"
import { Input } from "@/_components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/_components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { useTheme } from "next-themes"
import { useState } from "react"

/**
 * カラーテーマ設定ページ
 */
export default function SettingColor() {
  const themeRadio = (value: string, label: string) => {
    return (
      <div className="w-auto">
        <div className="flex items-center space-x-2 bg-monotone-200/60">
          <RadioGroupItem value={value} id={value} />
          <label htmlFor={value}>{label}</label>
        </div>
      </div>
    )
  }

  type SampleTabType = "sampleTab1" | "sampleTab2" | "sampleTab3"
  const defaultTab = "sampleTab1"
  const [activeTab, setActiveTab] = useState<SampleTabType>(defaultTab)
  // TabTriggerがクリックされたときにactiveTabを更新
  const handleTabClick = (value: SampleTabType) => {
    setActiveTab(value as SampleTabType)
  }
  let activePage = 1
  // setActiveTab(defaultTab)
  const setPage = (page: number) => {
    activePage = page
  }
  const handlerInput = (value: string) => {
    const x = value
  }

  const { theme, setTheme } = useTheme()

  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"カラーテーマ"}</p>
        <RadioGroup
          value={theme}
          onValueChange={(value) => {
            setTheme(value)
          }}
        >
          {themeRadio("system", "デバイスのモードを使用する")}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] items-center justify-center gap-2">
            {themeRadio("light", "ライトモード")}
            {themeRadio("dark", "ダークモード")}
            {themeRadio("skyblue", "スカイブルー")}
            {themeRadio("forest", "フォレスト")}
            {themeRadio("snow", "スノーホワイト")}
            {themeRadio("sakura", "サクラピンク")}
            {themeRadio("mikan", "ミカンイエロー")}
            {themeRadio("summer", "サマーブルー")}
            {themeRadio("autumn", "オータムグリーン")}
            {themeRadio("winter", "ウインターグレー")}
            {themeRadio("spring", "スプリングレッド")}
            {themeRadio("sunday", "サンデーブロンズ")}
          </div>
        </RadioGroup>
        UI表示テスト
        <Card className="mx-3 inline-block h-9 w-24">カード表示</Card>
        <div className="mx-3 inline-block h-9 w-20 bg-foreground text-background">
          反転表示
        </div>
        <div className="mx-3 inline-block h-9 w-20 bg-popover text-popover-foreground">
          メニュー
        </div>
        <div className="mx-3 inline-block h-9 w-20 bg-accent text-accent-foreground">
          アクセント
        </div>
      </div>
      <Button className="m-1" variant="default">
        ボタン
      </Button>
      <Button className="m-1" variant="destructive">
        destructive
      </Button>
      <Button className="m-1" variant="outline">
        outline
      </Button>
      <Button className="m-1" variant="secondary">
        secondary
      </Button>
      <Button className="m-1" variant="ghost">
        ghost
      </Button>
      <Button className="m-1" variant="link">
        link
      </Button>
      <Input
        className="mx-2 w-80"
        id="sampleText1"
        placeholder="プレースホルダー"
        onChange={(e) => handlerInput(e.target.value)}
      />
      <Input
        className="mx-2 w-80"
        id="sampleText2"
        placeholder=""
        value="入力済み"
        onChange={(e) => handlerInput(e.target.value)}
      />
      <Tabs>
        <div className="border-b">
          <TabsList className="mx-0 mb-1 md:mx-4">
            <TabsTrigger
              value="sampleTab1"
              onClick={() => handleTabClick("sampleTab1")}
            >
              タブ1
            </TabsTrigger>
            <TabsTrigger
              value="sampleTab2"
              onClick={() => handleTabClick("sampleTab2")}
            >
              タブ2
            </TabsTrigger>
            <TabsTrigger
              value="sampleTab3"
              onClick={() => handleTabClick("sampleTab3")}
            >
              タブ3
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
      <ResponsivePagination
        perPage={32}
        maxCount={200}
        currentPage={activePage}
        onPageChange={(page: number) => {
          setPage(page)
        }}
      />
    </AppPageCenter>
  )
}
