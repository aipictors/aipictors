import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext, useEffect, useMemo, useRef } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { GenerationCanvasActions } from "~/routes/($lang).generation._index/components/generation-view/generation-canvas-actions"
import { useCachedImageGenerationResult } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-result"
import { useCachedImageGenerationTask } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

const GenerationCanvasOutputQuery = graphql(
  "query GenerationCanvasOutput { viewer { id imageGenerationResults(offset: 0, limit: 56) { id imageUrl thumbnailUrl completedAt prompt } } }",
)

type Props = {
  /** 同じ設定で Seed だけ変えて生成する（画像の下の「再生成」） */
  onReroll?: () => void
}

/** 生成直後の画像、または選択中の履歴画像を中央に表示する。下に保存・共有・投稿などの操作を並べる */
export function GenerationCanvasOutput(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const context = useGenerationContext()
  const { data, refetch } = useQuery(GenerationCanvasOutputQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    fetchPolicy: "cache-and-network",
  })

  const resultNodes = data?.viewer?.imageGenerationResults ?? []
  const results = useMemo(
    () => resultNodes.filter((result) => result.id && result.imageUrl),
    [resultNodes],
  )
  const resultIds = useMemo(() => results.map((result) => result.id), [results])
  const selectedResult = results.find(
    (result) => result.id === context.config.viewTaskId,
  )
  const cachedResult = useCachedImageGenerationResult(
    context.config.viewTaskId ?? "",
  )
  const cachedTask = useCachedImageGenerationTask(
    context.config.viewTaskId ?? "",
  )
  const selected = selectedResult ?? cachedResult ?? cachedTask ?? results[0]
  const updateViewTaskRef = useRef(context.updateViewTask)

  useEffect(() => {
    updateViewTaskRef.current = context.updateViewTask
  }, [context.updateViewTask])

  useEffect(() => {
    if (context.config.viewTaskId || !results[0]?.id) return
    updateViewTaskRef.current(results[0].id, resultIds)
  }, [context.config.viewTaskId, resultIds, results])

  useEffect(() => {
    const onResultArrived = async () => {
      const refreshed = await refetch()
      const newestResults = (
        refreshed.data?.viewer?.imageGenerationResults ?? []
      ).filter((result) => result.id && result.imageUrl)
      if (newestResults[0]?.id) {
        updateViewTaskRef.current(
          newestResults[0].id,
          newestResults.map((result) => result.id),
        )
      }
    }
    window.addEventListener("generation:result-arrived", onResultArrived)
    return () =>
      window.removeEventListener("generation:result-arrived", onResultArrived)
  }, [refetch])

  if (!selected?.imageUrl) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed bg-background/70 p-8 text-center text-muted-foreground text-sm">
        {t(
          "生成した画像がここに表示されます",
          "Your generated images will appear here",
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-xl bg-background p-3">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <img
          key={selected.id}
          src={normalizeGenerativeFileUrl(selected.imageUrl)}
          alt={selected.prompt ?? t("生成画像", "Generated image")}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <GenerationCanvasActions
        key={selected.id}
        resultId={selected.id}
        onReroll={props.onReroll}
      />
    </div>
  )
}
