import type { ResultOf } from "gql.tada"
import type { Dispatch } from "react"
import { useEffect, useRef } from "react"
import type { PostTextFormAction } from "~/routes/($lang)._main.new.text/reducers/actions/post-text-form-action"
import type { viewerQuery } from "~/routes/($lang)._main.new.text/utils/new-text-queries"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"

type Props = {
  generationNanoids: string[]
  viewerData: ResultOf<typeof viewerQuery> | undefined
  dispatch: Dispatch<PostTextFormAction>
}

/**
 * 生成履歴から投稿するとき、選んだ画像とプロンプトをフォームに入れる
 */
export function usePostTextGenerationResults(props: Props) {
  const { generationNanoids, viewerData, dispatch } = props

  const generationResultsKey =
    viewerData?.viewer?.imageGenerationResults?.map((r) => r.id).join("|") ?? ""

  const processedGenerationKeyRef = useRef<string>("")

  useEffect(() => {
    let cancelled = false
    const processImages = async () => {
      if (generationNanoids.length === 0) {
        return
      }

      const results = viewerData?.viewer?.imageGenerationResults
      if (!results || results.length === 0) {
        return
      }

      const key = `${generationNanoids.join("|")}::${generationResultsKey}`
      if (processedGenerationKeyRef.current === key) {
        return
      }
      processedGenerationKeyRef.current = key

      const base64Urls = await Promise.all(
        results
          .map((result) => {
            const url = result.imageUrl ?? result.thumbnailUrl
            return url ? createBase64FromImageURL(url) : ""
          })
          .filter((url) => url !== ""),
      )

      if (cancelled) {
        return
      }

      dispatch({
        type: "SET_ITEMS",
        payload: base64Urls.map((content, index) => ({
          id: index,
          content,
        })),
      })

      dispatch({
        type: "SET_THUMBNAIL_BASE64",
        payload: base64Urls[0] ?? null,
      })

      const first = results[0]
      dispatch({
        type: "SET_PNG_INFO",
        payload: {
          src: null,
          params: {
            prompt: first.prompt,
            negativePrompt: first.negativePrompt,
            seed: first.seed.toString(),
            sampler: first.sampler,
            strength: "",
            noise: "",
            model: first.model?.name,
            modelHash: first.model?.id,
            steps: first.steps.toString(),
            scale: first.scale.toString(),
            vae: "",
          },
        },
      })

      dispatch({
        type: "IS_SELECTED_GENERATION_IMAGE",
        payload: true,
      })
    }

    processImages()
    return () => {
      cancelled = true
    }
  }, [generationNanoids.join("|"), generationResultsKey])
}
