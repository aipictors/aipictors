import { AppPageCenter } from "@/components/app/app-page-center"
import { ResponsivePagination } from "@/components/responsive-pagination"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { useState } from "react"

/**
 * カラーテーマ設定ページ
 */
export default function SettingColor() {
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
  const setColorTheme = (mode: string, color: string) => {
    if (mode === "system") {
      setTheme("system")
      return
    }
    if (color === "none") {
      // "light" || "dark"
      setTheme(mode)
      return
    }
    const themeName = `${mode}-${color}`
    setTheme(themeName)
  }
  const setMode = (theme: string) => {
    if (theme === "system" || theme === "light" || theme === "dark") {
      return theme
    }
    if (theme.startsWith("light-")) {
      return "light"
    }
    if (theme.startsWith("dark-")) {
      return "dark"
    }
    return "system"
  }
  const mode = setMode(theme ? theme : "system")
  const setColorSchema = (theme: string) => {
    if (theme === "system" || theme === "light" || theme === "dark") {
      return "none"
    }
    const suffix = theme.replace(/(light|dark)\-/, "")
    return suffix ?? "none"
  }
  const colorSchema = setColorSchema(theme ? theme : "system")
  const themeRadio = (value: string, label: string) => {
    return (
      <div className="w-auto">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={value} id={value} />
          <label htmlFor={value}>{label}</label>
        </div>
      </div>
    )
  }
  const themeRadioColor = (
    value: string,
    label: string,
    colorValue: string,
  ) => {
    return (
      <div className="w-auto">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value={value} id={value} />
          <label htmlFor={value}>
            <span className={colorValue}>●</span>
            {label}
          </label>
        </div>
      </div>
    )
  }

  return (
    <AppPageCenter>
      <div className="w-full space-y-8">
        <p className="font-bold text-2xl">{"カラーテーマ"}</p>
        <RadioGroup
          value={mode}
          name="mode"
          onValueChange={(value) => {
            setColorTheme(value, colorSchema)
            setMode(useTheme().theme ?? "system")
          }}
        >
          {themeRadio("system", "デバイスのモードを使用する")}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] items-center justify-center gap-2">
            {themeRadio("light", "ライトモード")}
            {themeRadio("dark", "ダークモード")}
          </div>
          <hr />
        </RadioGroup>
        <div>ライトかダークを選択すると色も選べます。</div>
        <RadioGroup
          value={colorSchema}
          name="colorSchema"
          onValueChange={(value) => {
            setColorTheme(mode, value)
            setColorSchema(useTheme().theme ?? "system")
          }}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] items-center justify-center gap-2">
            {themeRadioColor("none", "デフォルト", "text-white")}
            {themeRadioColor("gray", "グレー", "text-gray-500")}
            {themeRadioColor("red", "レッド", "text-red-500")}
            {themeRadioColor("pink", "ピンク", "text-pink-500")}
            {themeRadioColor("orange", "オレンジ", "text-orange-500")}
            {themeRadioColor("green", "グリーン", "text-green-500")}
            {themeRadioColor("blue", "ブルー", "text-blue-500")}
            {themeRadioColor("yellow", "イエロー", "text-yellow-500")}
            {themeRadioColor("violet", "バイオレット", "text-violet-500")}
          </div>
        </RadioGroup>
        UI表示テスト
        <Card className="mx-3 inline-block h-9 w-24 text-center">
          カード表示
        </Card>
        <div className="mx-3 inline-block h-9 w-20 bg-foreground text-center text-background">
          反転表示
        </div>
        <div className="mx-3 inline-block h-9 w-20 bg-popover text-center text-popover-foreground">
          メニュー
        </div>
        <div className="mx-3 inline-block h-9 w-20 bg-accent text-center text-accent-foreground">
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
