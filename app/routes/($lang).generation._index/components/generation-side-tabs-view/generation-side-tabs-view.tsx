import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

const tabsListClassName =
  "h-auto w-full justify-start gap-4 whitespace-nowrap rounded-none border-b bg-transparent p-0 px-1"

const tabsTriggerClassName =
  "-mb-px flex-none rounded-none border-transparent border-b-2 px-0.5 pt-1.5 pb-2 text-muted-foreground data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"

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
            <TabsList className={tabsListClassName}>
              <TabsTrigger
                onClick={() => {
                  send({ type: "CHANGE_FULL_HISTORY_LIST" })
                  context.updateSearchWorksModelIdAndName(null, null)
                }}
                className={tabsTriggerClassName}
                value="HISTORY_LIST_FULL"
              >
                {t("履歴", "History")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "CHANGE_FULL_WORK_LIST" })
                  context.updateSearchWorksModelIdAndName(null, null)
                }}
                className={tabsTriggerClassName}
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
            <TabsList className={tabsListClassName}>
              <TabsTrigger
                onClick={() => {
                  send({ type: "CLOSE" })
                }}
                className={tabsTriggerClassName}
                value="PROMPT_VIEW"
              >
                {t("履歴", "History")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_WORKS_FROM_MODEL" })
                }}
                className={tabsTriggerClassName}
                value="WORKS_FROM_MODEL"
              >
                {t("作品検索", "Search posts")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_COMMUNICATION" })
                }}
                className={tabsTriggerClassName}
                value="COMMUNICATION"
              >
                {t("ご意見", "Feedback")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_LINKS" })
                }}
                className={tabsTriggerClassName}
                value="LINKS"
              >
                {t("アンケート", "Survey")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_LOGS" })
                }}
                className={tabsTriggerClassName}
                value="LOGS"
              >
                {t("ログ", "Logs")}
              </TabsTrigger>
              <TabsTrigger
                onClick={() => {
                  send({ type: "OPEN_COIN_HISTORY" })
                }}
                className={tabsTriggerClassName}
                value="COIN_HISTORY"
              >
                {t("コイン履歴", "Coin history")}
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      )}
      {/* ログ内容は aside 側で表示するため、ここでは描画しない */}
    </>
  )
}
