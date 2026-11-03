import type { Dispatch } from "react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import type { ResultOf } from "gql.tada"
import type { TranslationFn } from "~/hooks/use-translation"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { ViewerQuery } from "~/routes/($lang)._main.new.image/utils/new-image-queries"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { getExtractInfoFromBase64 } from "~/utils/get-extract-info-from-png"

type Props = {
  /**
   * URL の generation（生成履歴の nanoid を | でつないだもの）
   */
  ref: string | null
  viewerData: ResultOf<typeof ViewerQuery> | undefined
  dispatch: Dispatch<PostImageFormAction>
  dispatchInput: Dispatch<PostImageFormInputAction>
  t: TranslationFn
}

/**
 * 生成履歴から投稿するとき、選んだ画像とプロンプトをフォームに入れる
 */
export function usePostImageGenerationResults(props: Props) {
  const { ref, viewerData, dispatch, dispatchInput, t } = props

  const generationResultsKey =
    viewerData?.viewer?.imageGenerationResults?.map((r) => r.id).join("|") ?? ""
  const processedGenerationKeyRef = useRef<string>("")

  useEffect(() => {
    let cancelled = false
    const processImages = async () => {
      if (viewerData?.viewer?.imageGenerationResults && ref) {
        const key = `${ref}::${generationResultsKey}`
        if (processedGenerationKeyRef.current === key) {
          return
        }
        processedGenerationKeyRef.current = key

        const results = viewerData.viewer.imageGenerationResults

        const settled = await Promise.allSettled(
          results.map(async (result) => {
            const url = result.imageUrl ?? result.thumbnailUrl
            if (!url) return null
            const base64 = await createBase64FromImageURL(url)
            return base64 ? { base64, result } : null
          }),
        )

        const fulfilled = settled
          .filter(
            (
              s,
            ): s is PromiseFulfilledResult<{
              base64: string
              result: (typeof results)[number]
            } | null> => s.status === "fulfilled",
          )
          .map((s) => s.value)
          .filter(
            (v): v is { base64: string; result: (typeof results)[number] } =>
              Boolean(v?.base64),
          )

        if (cancelled) {
          return
        }

        if (fulfilled.length === 0) {
          toast(
            t(
              "生成画像の取得に失敗しました（URLのアクセス制限/CORSの可能性があります）",
              "Failed to load generated images (possible access restriction/CORS)",
            ),
          )
          dispatch({
            type: "IS_SELECTED_GENERATION_IMAGE",
            payload: false,
          })
          return
        }

        const items = fulfilled.map((entry, index) => ({
          id: index + 1,
          content: entry.base64,
          generationNanoid: entry.result.nanoid,
        }))

        dispatch({
          type: "SET_ITEMS",
          payload: items,
        })

        dispatch({
          type: "SET_THUMBNAIL_BASE64",
          payload: items[0].content,
        })

        const primary = fulfilled[0].result

        // PNGメタ情報の抽出は失敗しても投稿は可能なので、例外は握りつぶす
        try {
          const infoUrl = primary.imageUrl ?? primary.thumbnailUrl
          if (infoUrl) {
            const proxied = getDownloadProxyUrl(infoUrl)
            const pngInfo = await getExtractInfoFromBase64(proxied)
            pngInfo.params.prompt = primary.prompt
            pngInfo.params.negativePrompt = primary.negativePrompt

            dispatchInput({
              type: "SET_IMAGE_INFORMATION",
              payload: pngInfo,
            })
          }
        } catch {
          // noop
        }

        dispatchInput({
          type: "SET_AI_MODEL_ID",
          payload: primary.postModelId?.toString() ?? "",
        })

        dispatch({
          type: "IS_SELECTED_GENERATION_IMAGE",
          payload: true,
        })
      }
    }

    processImages()
    return () => {
      cancelled = true
    }
  }, [ref, generationResultsKey])
}
