import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

/**
 * サイドコンテンツ切替タブ
 */
export function GenerationSideTabsView () {
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
          <div className="w-full overflow-x-auto">
            <TabsList className="justify-start gap-1 whitespace-nowrap">
              <TabsTrigger
                onClick={() => {
                  send({ type: "CHANGE_FULL_HISTORY_LIST" })
                  context.updateSearchWorksModelIdAndName(null, null)
                }}
                className="flex-none"
                value="HISTORY_LIST_FULL"
              >
                {t("履歴", "History")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "CHANGE_FULL_WORK_LIST" })
                  context.updateSearchWorksModelIdAndName(null, null)
                }}
                className="flex-none"
                value="WORK_LIST_FULL"
              >
                {t("検索", "Search")}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      ) : (
        <Tabs value={state.toString()} defaultValue={"PROMPT_VIEW"}>
          <div className="w-full overflow-x-auto">
            <TabsList className="justify-start gap-1 whitespace-nowrap">
              <TabsTrigger
                onClick={() => {
                  send({ type: "CLOSE" })
                }}
                className="flex-none"
                value="PROMPT_VIEW"
              >
                {t("履歴", "History")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_WORKS_FROM_MODEL" })
                }}
                className="flex-none"
                value="WORKS_FROM_MODEL"
              >
                {t("作品検索", "Search posts")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_COMMUNICATION" })
                }}
                className="flex-none"
                value="COMMUNICATION"
              >
                {t("ご意見", "Feedback")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_LINKS" })
                }}
                className="flex-none"
                value="LINKS"
              >
                {t("アンケート", "Survey")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_LOGS" })
                }}
                className="flex-none"
                value="LOGS"
              >
                {t("ログ", "Logs")}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      )}
      {/* ログ内容は aside 側で表示するため、ここでは描画しない */}
    </>
  )
}
