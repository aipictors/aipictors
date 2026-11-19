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
}

/** PC の右パネル（Model / Styles / Settings のタブ） */
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

  const scrollToSection = (value: GenerationPanelTab) => {
    setTab(value)
    document
      .getElementById(`generation-panel-section-${value}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const updateActiveTab = (event: React.UIEvent<HTMLDivElement>) => {
    const threshold = event.currentTarget.getBoundingClientRect().top + 80
    let activeTab: GenerationPanelTab = "model"

    for (const item of tabs) {
      const section = document.getElementById(
        `generation-panel-section-${item.value}`,
      )
      if (section && section.getBoundingClientRect().top <= threshold) {
        activeTab = item.value
      }
    }

    if (activeTab !== tab) setTab(activeTab)
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col bg-background">
      <nav
        aria-label={t("生成の設定", "Generation settings")}
        className="flex shrink-0 gap-1 border-b bg-background px-3"
      >
        {tabs.map((item) => {
          const isActive = tab === item.value
          return (
            <button
              key={item.value}
              type="button"
              id={`generation-panel-tab-${item.value}`}
              aria-current={isActive ? "location" : undefined}
              aria-controls={`generation-panel-section-${item.value}`}
              onClick={() => scrollToSection(item.value)}
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
      </nav>
      <div
        onScroll={updateActiveTab}
        className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
      >
        <section
          id="generation-panel-section-model"
          aria-labelledby="generation-panel-tab-model"
          className="scroll-mt-3 px-4 py-4"
        >
          {props.model}
        </section>
        <section
          id="generation-panel-section-styles"
          aria-labelledby="generation-panel-tab-styles"
          className="scroll-mt-3 border-t px-4 py-4"
        >
          {props.styles}
        </section>
        <section
          id="generation-panel-section-settings"
          aria-labelledby="generation-panel-tab-settings"
          className="scroll-mt-3 border-t px-4 py-4"
        >
          {props.settings}
        </section>
      </div>
    </aside>
  )
}
