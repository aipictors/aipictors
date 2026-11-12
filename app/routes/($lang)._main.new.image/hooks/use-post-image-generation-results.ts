import type { ResultOf } from "gql.tada"
import type { Dispatch } from "react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import type { TranslationFn } from "~/hooks/use-translation"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormInputAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-input-action"
import type { ViewerQuery } from "~/routes/($lang)._main.new.image/utils/new-image-queries"
import { toGenerationImageInformation } from "~/routes/($lang)._main.new.image/utils/to-generation-image-information"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import {
  getExtractInfoFromBase64,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"

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

        // 同時に読むと展開した画像が重なり、スマートフォンでは投稿画面が落ちるので 1 枚ずつ
        const fulfilled: {
          base64: string
          result: (typeof results)[number]
        }[] = []
        for (const result of results) {
          if (cancelled) {
            return
          }
          const url = result.imageUrl ?? result.thumbnailUrl
          if (!url) continue
          try {
            const base64 = await createBase64FromImageURL(url)
            if (base64) {
              fulfilled.push({ base64, result })
            }
          } catch (error) {
            console.warn("Failed to load generated image", error)
          }
        }

        if (cancelled) {
          return
        }

        if (fulfilled.length === 0) {
          // やり直せるように、処理済みの印を消しておく
          processedGenerationKeyRef.current = ""
          toast(
            t(
              "生成画像を読み込めませんでした。しばらくしてから、または枚数を減らしてお試しください",
              "Couldn't load the generated images. Please try again in a moment, or select fewer images.",
            ),
          )
          dispatch({
            type: "IS_SELECTED_GENERATION_IMAGE",
            payload: false,
          })
          return
        }

        if (fulfilled.length < results.length) {
          toast(
            t(
              `${results.length}枚中${fulfilled.length}枚を読み込みました（読み込めなかった画像はあとから追加できます）`,
              `Loaded ${fulfilled.length} of ${results.length} images (you can add the rest later)`,
            ),
          )
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

        // PNG に生成情報がない画像もあるので、生成履歴の内容で必ず埋める
        let pngInfo: PNGInfo | null = null
        try {
          const infoUrl = primary.imageUrl ?? primary.thumbnailUrl
          if (infoUrl) {
            pngInfo = await getExtractInfoFromBase64(
              getDownloadProxyUrl(infoUrl),
            )
          }
        } catch {
          // PNG でない・取得できないときは生成履歴の内容だけを使う
        }

        dispatchInput({
          type: "SET_IMAGE_INFORMATION",
          payload: toGenerationImageInformation(primary, pngInfo),
        })

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
