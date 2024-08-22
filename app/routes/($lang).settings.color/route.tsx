import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTheme } from "next-themes"
import { useState } from "react"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { Separator } from "~/components/ui/separator"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const meta: MetaFunction = () => {
  return createMeta(META.SETTINGS_COLOR)
}

export default function SettingColor() {
  const [activeTab, setActiveTab] = useState<string>("sampleTab1")
  const [activePage, setActivePage] = useState<number>(1)
  const { theme, setTheme } = useTheme()

  const handleTabClick = (value: string) => setActiveTab(value)

  const setColorTheme = (mode: string, color: string) => {
    setTheme(
      mode === "system"
        ? "system"
        : color === "none"
          ? mode
          : `${mode}-${color}`,
    )
  }

  const getMode = (theme: string): string => {
    if (["system", "light", "dark"].includes(theme)) return theme
    return theme.startsWith("light-")
      ? "light"
      : theme.startsWith("dark-")
        ? "dark"
        : "system"
  }

  const getColorSchema = (theme: string): string => {
    if (["system", "light", "dark"].includes(theme)) return "none"
    return theme.replace(/(light|dark)-/, "") ?? "none"
  }

  const mode = getMode(theme ?? "system")
  const colorSchema = getColorSchema(theme ?? "system")

  const themeRadio = (value: string, label: string) => (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      className={`flex w-full cursor-pointer items-center space-x-2 rounded-lg border p-2 transition duration-150 hover:bg-gray-100 hover:dark:bg-gray-800 ${
        // biome-ignore lint/nursery/useSortedClasses: <explanation>
        mode === value ? "bg-gray-100 dark:bg-gray-800 bg-opacity-50" : ""
      }`}
      onClick={() => setColorTheme(value, colorSchema)}
    >
      <RadioGroupItem value={value} id={value} className="peer hidden" />
      <label
        htmlFor={value}
        className="flex cursor-pointer items-center peer-checked:text-blue-500"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 transition duration-150 peer-checked:border-blue-500 peer-checked:bg-blue-500" />
        <span className="ml-2">{label}</span>
      </label>
    </div>
  )

  const themeRadioColor = (
    value: string,
    label: string,
    colorValue: string,
  ) => (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      className={`flex w-full cursor-pointer items-center space-x-2 rounded-lg border p-2 transition duration-150 hover:bg-gray-100 hover:dark:bg-gray-800 ${colorSchema === value ? "bg-gray-100 bg-opacity-50 dark:bg-gray-800" : ""}`}
      onClick={() => setColorTheme(mode, value)}
    >
      <RadioGroupItem value={value} id={value} className="peer hidden" />
      <label
        htmlFor={value}
        className="flex cursor-pointer items-center peer-checked:text-blue-500"
      >
        <span
          className={`h-4 w-4 rounded-full ${colorValue} flex items-center justify-center transition duration-150 peer-checked:ring-2 peer-checked:ring-blue-500`}
        />
        <span className="ml-2">{label}</span>
      </label>
    </div>
  )

  return (
    <div className="flex flex-col space-y-2">
      <div className="block md:hidden">
        <SettingsHeader title="カラーテーマ" />
      </div>
      <RadioGroup
        value={mode}
        name="mode"
        onValueChange={(value) => setColorTheme(value, colorSchema)}
        className="space-y-2"
      >
        <div className="space-y-2">
          {themeRadio("system", "デバイスのモードを使用する")}
          {themeRadio("light", "ライトモード")}
          {themeRadio("dark", "ダークモード")}
        </div>
        <p className="tex-tsm">ライトかダークを選択すると色も選べます。</p>
        <Separator />
      </RadioGroup>
      <div className={`space-y-2 ${theme === "system" ? "opacity-20" : ""}`}>
        <RadioGroup
          value={colorSchema}
          name="colorSchema"
          onValueChange={(value) => setColorTheme(mode, value)}
          className="space-y-2"
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {themeRadioColor("none", "デフォルト", "bg-gray-100")}
            {themeRadioColor("gray", "グレー", "bg-gray-500")}
            {themeRadioColor("red", "レッド", "bg-red-500")}
            {themeRadioColor("pink", "ピンク", "bg-pink-500")}
            {themeRadioColor("orange", "オレンジ", "bg-orange-500")}
            {themeRadioColor("green", "グリーン", "bg-green-500")}
            {themeRadioColor("blue", "ブルー", "bg-blue-500")}
            {themeRadioColor("yellow", "イエロー", "bg-yellow-500")}
            {themeRadioColor("violet", "バイオレット", "bg-violet-500")}
          </div>
        </RadioGroup>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="default">ボタン</Button>
          <Button variant="destructive">destructive</Button>
          <Button variant="outline">outline</Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="link">link</Button>
        </div>
        <div className="mt-4 space-y-2">
          <Input
            className="mx-2 w-80"
            id="sampleText1"
            placeholder="プレースホルダー"
            onChange={(e) => {}}
          />
          <Input
            className="mx-2 w-80"
            id="sampleText2"
            placeholder=""
            value="入力済み"
            onChange={(e) => {}}
          />
        </div>
        <Tabs>
          <div className="border-b">
            <TabsList className="flex space-x-2">
              <TabsTrigger
                value="sampleTab1"
                onClick={() => handleTabClick("sampleTab1")}
                className={activeTab === "sampleTab1" ? "active-tab" : ""}
              >
                タブ1
              </TabsTrigger>
              <TabsTrigger
                value="sampleTab2"
                onClick={() => handleTabClick("sampleTab2")}
                className={activeTab === "sampleTab2" ? "active-tab" : ""}
              >
                タブ2
              </TabsTrigger>
              <TabsTrigger
                value="sampleTab3"
                onClick={() => handleTabClick("sampleTab3")}
                className={activeTab === "sampleTab3" ? "active-tab" : ""}
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
          onPageChange={(page: number) => setActivePage(page)}
        />
      </div>
    </div>
  )
}
