import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ChevronRightIcon, HistoryIcon } from "lucide-react"
import { useContext, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationTaskListItemFragment } from "~/routes/($lang).generation._index/components/task-view/generation-task-list"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

const RecentGenerationResultsQuery = graphql(
  `query GenerationSidebarRecentHistory {
    viewer {
      id
      imageGenerationResults(offset: 0, limit: 6) {
        ...GenerationTaskListItem
      }
    }
  }`,
  [GenerationTaskListItemFragment],
)

type Props = {
  isCollapsed: boolean
}

export function GenerationSidebarRecentHistory(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const actor = GenerationConfigContext.useActorRef()
  const context = useGenerationContext()
  const { data, refetch } = useQuery(RecentGenerationResultsQuery, {
    skip:
      props.isCollapsed || authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-and-network",
  })

  const recentResults = (data?.viewer?.imageGenerationResults ?? [])
    .filter((result) => result.imageUrl !== null && result.id !== null)
    .slice(0, 6)

  useEffect(() => {
    if (typeof window === "undefined") return
    const onResultArrived = () => {
      void refetch()
    }
    window.addEventListener("generation:result-arrived", onResultArrived)
    return () => {
      window.removeEventListener("generation:result-arrived", onResultArrived)
    }
  }, [refetch])

  if (props.isCollapsed || recentResults.length === 0) return null

  const openHistory = () => actor.send({ type: "OPEN_FULL_HISTORY_LIST" })
  const openResult = (taskId: string) => {
    context.updateViewTask(
      taskId,
      recentResults.map((result) => result.id),
    )
  }

  return (
    <section className="mt-3 flex min-h-0 flex-1 flex-col border-t pt-3">
      <h2 className="mb-2 flex items-center gap-2 px-1 font-semibold text-muted-foreground text-xs">
        <HistoryIcon className="size-4" />
        {t("生成履歴", "Recent generations")}
      </h2>
      <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 content-start gap-1 overflow-y-auto">
        {recentResults.map((result) => (
          <button
            key={result.id}
            type="button"
            onClick={() => openResult(result.id)}
            aria-label={t("この生成結果を表示", "View this generation")}
            className="aspect-square min-w-0 overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-80"
          >
            <img
              src={normalizeGenerativeFileUrl(result.imageUrl ?? "")}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={openHistory}
        className="mt-2 h-8 w-full justify-between px-2 text-xs"
      >
        {t("すべて見る", "View all")}
        <ChevronRightIcon className="size-3.5" />
      </Button>
    </section>
  )
}
