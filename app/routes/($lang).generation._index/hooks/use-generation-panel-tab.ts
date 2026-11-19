import { useLocalStorage } from "usehooks-ts"

export type GenerationPanelTab = "model" | "styles" | "settings"

/**
 * PC の右パネルで開いているタブ（中央の「おすすめの画風」などから切り替える）
 */
export function useGenerationPanelTab() {
  const [tab, setTab] = useLocalStorage<GenerationPanelTab>(
    "generation-panel-tab",
    "model",
  )
  const value: GenerationPanelTab =
    tab === "styles" || tab === "settings" ? tab : "model"
  return [value, setTab] as const
}
