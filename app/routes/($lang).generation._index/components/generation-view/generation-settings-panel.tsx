import { BoxIcon, PaletteIcon, SlidersHorizontalIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  type GenerationPanelTab,
  useGenerationPanelTab,
} from "~/routes/($lang).generation._index/hooks/use-generation-panel-tab"

type Props = {
  model: React.ReactNode
  styles: React.ReactNode
  settings: React.ReactNode
  /**
   * 下に固定する生成ボタン（コイン・高解像度を含む）
   */
  submission: React.ReactNode
}

/**
 * PC の右パネル（Model / Styles / Settings のタブ + 下に固定の生成ボタン）
 */
export function GenerationSettingsPanel(props: Props) {
  const t = useTranslation()

  const [tab, setTab] = useGenerationPanelTab()

  const tabs: {
    value: GenerationPanelTab
    label: string
    icon: React.ReactNode
  }[] = [
    {
      value: "model",
      label: t("モデル", "Model"),
      icon: <BoxIcon className="size-4" />,
    },
    {
      value: "styles",
      label: t("画風", "Styles"),
      icon: <PaletteIcon className="size-4" />,
    },
    {
      value: "settings",
      label: t("設定", "Settings"),
      icon: <SlidersHorizontalIcon className="size-4" />,
    },
  ]

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-background">
      <div
        role="tablist"
        aria-label={t("生成の設定", "Generation settings")}
        className="flex shrink-0 gap-1 border-b px-3"
      >
        {tabs.map((item) => {
          const isActive = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              id={`generation-panel-tab-${item.value}`}
              aria-selected={isActive}
              aria-controls={`generation-panel-${item.value}`}
              onClick={() => setTab(item.value)}
              className={cn(
                "-mb-px flex h-11 items-center gap-1.5 border-b-2 px-2 font-medium text-sm transition-colors",
                isActive
                  ? "border-fuchsia-500 text-foreground dark:border-fuchsia-400"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`generation-panel-${tab}`}
        aria-labelledby={`generation-panel-tab-${tab}`}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {tab === "model" && props.model}
        {tab === "styles" && props.styles}
        {tab === "settings" && props.settings}
      </div>
      <div className="shrink-0 border-t bg-background p-3 [&>div]:border-t-0">
        {props.submission}
      </div>
    </aside>
  )
}
