import { Tabs, TabsList, TabsTrigger } from "@/_components/ui/tabs"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"

/**
 * サイドコンテンツ切替タブ
 * @returns
 */
export function GenerationSideTabsView() {
  const context = useGenerationContext()

  const { send } = GenerationConfigContext.useActorRef()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

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
              履歴
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "CHANGE_FULL_WORK_LIST" })
                context.updateSearchWorksModelIdAndName(null, null)
              }}
              className="w-full"
              value="WORK_LIST_FULL"
            >
              検索
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
              履歴
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_WORKS_FROM_MODEL" })
              }}
              className="w-full"
              value="WORKS_FROM_MODEL"
            >
              作品例検索
            </TabsTrigger>
            <TabsTrigger
              onClick={() => {
                send({ type: "OPEN_COMMUNICATION" })
              }}
              className="w-full"
              value="COMMUNICATION"
            >
              ご要望など
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </>
  )
}
