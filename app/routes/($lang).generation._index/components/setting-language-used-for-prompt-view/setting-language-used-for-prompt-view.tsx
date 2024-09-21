import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useTranslation } from "~/hooks/use-translation"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"

/**
 * プロンプトに使用する言語切り替えタブ
 */
export function SettingLanguageUsedForPromptView() {
  const context = useGenerationContext()

  const t = useTranslation()

  const handleTabChange = (value: string) => {
    if (value === "jp") {
      context.changeLanguageUsedForPrompt("jp")
    } else {
      context.changeLanguageUsedForPrompt(null)
    }
  }

  return (
    <>
      <Tabs
        defaultValue={context.config.languageUsedForPrompt || "default"}
        onValueChange={handleTabChange}
        value={context.config.languageUsedForPrompt || "default"}
        className="space-y-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="default" className="w-full">
            {t("デフォルト", "Default")}
          </TabsTrigger>
          <TabsTrigger value="jp" className="w-full">
            <div className="flex items-center space-x-2">
              <p>{t("日本語", "Japanese")}</p>
              <CrossPlatformTooltip
                text={t(
                  "プロンプトを日本語で入力することができるようになります",
                  "You will be able to input prompts in Japanese",
                )}
              />
            </div>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  )
}
