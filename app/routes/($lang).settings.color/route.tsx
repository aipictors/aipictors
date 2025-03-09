import { ResponsivePagination } from "~/components/responsive-pagination"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTheme } from "next-themes"
import { useState } from "react"
import { SettingsHeader } from "~/routes/($lang).settings/components/settings-header"
import { Separator } from "~/components/ui/separator"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

export const meta: MetaFunction = (props) => {
  return createMeta(META.SETTINGS_COLOR, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SettingColor() {
  const t = useTranslation()
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
    <div
      className={cn(
        "flex w-full cursor-pointer items-center space-x-2 rounded-lg border p-2 transition duration-150 hover:bg-gray-100 dark:hover:bg-gray-800",
        { "bg-gray-100 bg-opacity-50 dark:bg-gray-800": mode === value },
      )}
      onClick={() => setColorTheme(value, colorSchema)}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setColorTheme(value, colorSchema)
        }
      }}
    >
      <RadioGroupItem value={value} id={value} className="peer hidden" />
      <label
        htmlFor={value}
        className="flex cursor-pointer items-center peer-checked:text-blue-500"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 transition duration-150 peer-checked:border-blue-500 peer-checked:bg-blue-500" />
        <span className="ml-2">{t(label, label)}</span>
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
      className={cn(
        "flex w-full cursor-pointer items-center space-x-2 rounded-lg border p-2 transition duration-150 hover:bg-gray-100 dark:hover:bg-gray-800",
        { "bg-gray-100 bg-opacity-50 dark:bg-gray-800": colorSchema === value },
      )}
      onClick={() => setColorTheme(mode, value)}
    >
      <RadioGroupItem value={value} id={value} className="peer hidden" />
      <label
        htmlFor={value}
        className="flex cursor-pointer items-center peer-checked:text-blue-500"
      >
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full transition duration-150 peer-checked:ring-2 peer-checked:ring-blue-500",
            colorValue,
          )}
        />
        <span className="ml-2">{t(label, label)}</span>
      </label>
    </div>
  )

  return (
    <div className="flex flex-col space-y-2">
      <div className="block md:hidden">
        <SettingsHeader title={t("カラーテーマ", "Color Theme")} />
      </div>
      <RadioGroup
        value={mode}
        name="mode"
        onValueChange={(value) => setColorTheme(value, colorSchema)}
        className="space-y-2"
      >
        <div className="space-y-2">
          {themeRadio(
            "system",
            t("デバイスのモードを使用する", "Use device mode"),
          )}
          {themeRadio("light", t("ライトモード", "Light mode"))}
          {themeRadio("dark", t("ダークモード", "Dark mode"))}
        </div>
        <p className="text-sm">
          {t(
            "ライトかダークを選択すると色も選べます。",
            "You can select colors if you choose Light or Dark mode.",
          )}
        </p>
        <Separator />
      </RadioGroup>
      <div className={cn("space-y-2", { "opacity-20": theme === "system" })}>
        <RadioGroup
          value={colorSchema}
          name="colorSchema"
          onValueChange={(value) => setColorTheme(mode, value)}
          className="space-y-2"
        >
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {themeRadioColor("none", t("デフォルト", "Default"), "bg-gray-100")}
            {themeRadioColor("gray", t("グレー", "Gray"), "bg-gray-500")}
            {themeRadioColor("red", t("レッド", "Red"), "bg-red-500")}
            {themeRadioColor("pink", t("ピンク", "Pink"), "bg-pink-500")}
            {themeRadioColor(
              "orange",
              t("オレンジ", "Orange"),
              "bg-orange-500",
            )}
            {themeRadioColor("green", t("グリーン", "Green"), "bg-green-500")}
            {themeRadioColor("blue", t("ブルー", "Blue"), "bg-blue-500")}
            {themeRadioColor(
              "yellow",
              t("イエロー", "Yellow"),
              "bg-yellow-500",
            )}
            {themeRadioColor(
              "violet",
              t("バイオレット", "Violet"),
              "bg-violet-500",
            )}
          </div>
        </RadioGroup>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="default">{t("ボタン", "Button")}</Button>
          <Button variant="destructive">
            {t("destructive", "Destructive")}
          </Button>
          <Button variant="outline">{t("outline", "Outline")}</Button>
          <Button variant="secondary">{t("secondary", "Secondary")}</Button>
          <Button variant="ghost">{t("ghost", "Ghost")}</Button>
          <Button variant="link">{t("link", "Link")}</Button>
        </div>
        <div className="mt-4 space-y-2">
          <Input
            className="mx-2 w-80"
            id="sampleText1"
            placeholder={t("プレースホルダー", "Placeholder")}
            onChange={(e) => {}}
          />
          <Input
            className="mx-2 w-80"
            id="sampleText2"
            placeholder=""
            value={t("入力済み", "Filled")}
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
                {t("タブ1", "Tab 1")}
              </TabsTrigger>
              <TabsTrigger
                value="sampleTab2"
                onClick={() => handleTabClick("sampleTab2")}
                className={activeTab === "sampleTab2" ? "active-tab" : ""}
              >
                {t("タブ2", "Tab 2")}
              </TabsTrigger>
              <TabsTrigger
                value="sampleTab3"
                onClick={() => handleTabClick("sampleTab3")}
                className={activeTab === "sampleTab3" ? "active-tab" : ""}
              >
                {t("タブ3", "Tab 3")}
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
