import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * サイドコンテンツ切替タブ
 */
export function GenerationSideTabsView() {
  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const t = useTranslation()

  return (
    <>
      {state === "HISTORY_LIST_FULL" || state === "WORK_LIST_FULL" ? (
        <Tabs value={state.toString()} defaultValue={"HISTORY_LIST_FULL"}>
          <TabsList>
            <TabsTrigger
              onClick={() => {
                send({ type: "CHANGE_FULL_HISTORY_LIST" })
                context.updateSearchWorksModelIdAndName(null, null)
              }}
              className="w-full"
              value="HISTORY_LIST_FULL"
            >
              {t("履歴", "History")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "CHANGE_FULL_WORK_LIST" })
                context.updateSearchWorksModelIdAndName(null, null)
              }}
              className="w-full"
              value="WORK_LIST_FULL"
            >
              {t("検索", "Search")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      ) : (
        <Tabs value={state.toString()} defaultValue={"PROMPT_VIEW"}>
          <TabsList>
            <TabsTrigger
              onClick={() => {
                send({ type: "CLOSE" })
              }}
              className="w-full"
              value="PROMPT_VIEW"
            >
              {t("履歴", "History")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_WORKS_FROM_MODEL" })
              }}
              className="w-full"
              value="WORKS_FROM_MODEL"
            >
              {t("作品検索", "Search posts")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_COMMUNICATION" })
              }}
              className="w-full"
              value="COMMUNICATION"
            >
              {t("ご意見", "Feedback")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_LINKS" })
              }}
              className="w-full"
              value="LINKS"
            >
              {t("アンケート", "Survey")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                if (typeof document !== "undefined") {
                  window.location.href = "https://www.aipictors.com/generate/"
                }
              }}
              className="w-full"
              value="OLD_LINK"
            >
              {t("旧版", "Old")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </>
  )
}
