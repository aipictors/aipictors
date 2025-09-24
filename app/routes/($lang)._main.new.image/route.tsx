import { useEffect, useReducer, useContext, useState, useCallback } from "react"
import { useQuery, useMutation, useLazyQuery } from "@apollo/client/index"
import {
  type MetaFunction,
  useBeforeUnload,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { toast } from "sonner"
import { safeParse } from "valibot"
import { graphql } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { AuthContext } from "~/contexts/auth-context"
import { Button } from "~/components/ui/button"
import {
  PostImageFormAiModelFragment,
  PostImageFormAlbumFragment,
  PostImageFormInput,
  PostImageFormPassFragment,
  PostImageFormRecentlyUsedTagsFragment,
} from "~/routes/($lang)._main.new.image/components/post-image-form-input"
import { PostImageFormUploader } from "~/routes/($lang)._main.new.image/components/post-image-form-uploader"
import { SuccessCreatedWorkDialog } from "~/routes/($lang)._main.new.image/components/success-created-work-dialog"
import { CreatingWorkDialog } from "~/routes/($lang)._main.new.image/components/creating-work-dialog"
import { PostFormHeader } from "~/routes/($lang)._main.new.image/components/post-form-header"
import { postImageFormReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-reducer"
import { postImageFormInputReducer } from "~/routes/($lang)._main.new.image/reducers/post-image-form-input-reducer"
import { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { createBase64FromImageURL } from "~/routes/($lang).generation._index/utils/create-base64-from-image-url"
import {
  getExtractInfoFromBase64,
  type PNGInfo,
} from "~/utils/get-extract-info-from-png"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"
import type { LoaderFunctionArgs } from "react-router-dom"
import { useTranslation } from "~/hooks/use-translation"
import type { HeadersFunction } from "@remix-run/cloudflare"
import { loaderClient } from "~/lib/loader-client"

export default function NewImage() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const [searchParams] = useSearchParams()

  const ref = searchParams.get("generation")

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const { data: viewerData, loading } = useQuery(ViewerQuery, {
    skip: !authContext.isLoggedIn,
    fetchPolicy: "cache-and-network", // お題データの最新状態を取得するためキャッシュを無効化
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: authContext.userId ?? "-1",
      generationLimit: 64,
      generationOffset: 0,
      generationWhere: {
        nanoids: ref?.split("|") ?? [],
      },
      startAt: now.toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: afterDate.toISOString().split("T")[0],
    },
  })

  const viewer = data

  const [state, dispatch] = useReducer(postImageFormReducer, {
    editTargetImageBase64: null,
    indexList: [],
    isDrawing: false,
    isHovered: false,
    isOpenImageGenerationDialog: false,
    isSelectedGenerationImage: false,
    isThumbnailLandscape: false,
    items: [],
    ogpBase64: null,
    pngInfo: null,
    progress: 0,
    selectedImageGenerationIds: [],
    thumbnailBase64: null,
    thumbnailPosX: 0,
    thumbnailPosY: 0,
    uploadedWorkId: null,
    uploadedWorkUuid: null,
    videoFile: null,
    isOpenLoadingAi: false,
  })

  const [inputState, dispatchInput] = useReducer(postImageFormInputReducer, {
    accessType: "PUBLIC",
    generationParamAccessType: "PUBLIC",
    aiModelId: "1",
    albumId: null,
    caption: "",
    date: new Date(),
    enCaption: "",
    enTitle: "",
    imageInformation: null,
    imageStyle: "ILLUSTRATION",
    link: "",
    ratingRestriction: null,
    reservationDate: null,
    reservationTime: null,
    tags: [],
    themeId: null,
    title: "",
    useCommentFeature: true,
    useGenerationParams: true,
    usePromotionFeature: false,
    useTagFeature: true,
    correctionMessage: "",
    // デフォルト値（永続化設定で上書きされる）
    isBotGradingEnabled: true,
    isBotGradingPublic: true,
    isBotGradingRankingEnabled: true,
    botPersonality: "pictor_chan",
    botGradingType: "COMMENT_AND_SCORE",
  })

  const [isInitialized, setIsInitialized] = useState(false)

  // localStorageから設定を読み込む関数
  const loadBotSettings = () => {
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("post-bot-grading-settings")
        if (stored) {
          return JSON.parse(stored)
        }
      }
    } catch (error) {
      console.warn("Failed to load bot settings:", error)
    }
    return null
  }

  // localStorageに設定を保存する関数
  const saveBotSettings = (settings: {
    isBotGradingEnabled: boolean
    isBotGradingPublic: boolean
    isBotGradingRankingEnabled: boolean
    botPersonality: string
    botGradingType: string
  }) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "post-bot-grading-settings",
          JSON.stringify(settings),
        )
      }
    } catch (error) {
      console.warn("Failed to save bot settings:", error)
    }
  }

  // コンポーネントマウント後にlocalStorageから設定を読み込み
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInitialized) {
        const storedSettings = loadBotSettings()
        if (storedSettings) {
          dispatchInput({
            type: "SET_BOT_GRADING_ENABLED",
            payload: storedSettings.isBotGradingEnabled ?? true,
          })
          dispatchInput({
            type: "SET_BOT_GRADING_PUBLIC",
            payload: storedSettings.isBotGradingPublic ?? true,
          })
          dispatchInput({
            type: "SET_BOT_GRADING_RANKING_ENABLED",
            payload: storedSettings.isBotGradingRankingEnabled ?? true,
          })
          dispatchInput({
            type: "SET_BOT_PERSONALITY",
            payload: storedSettings.botPersonality ?? "pictor_chan",
          })
          dispatchInput({
            type: "SET_BOT_GRADING_TYPE",
            payload: storedSettings.botGradingType ?? "COMMENT_AND_SCORE",
          })
        }
        setIsInitialized(true)
      }
    }, 100) // 100msの遅延

    return () => clearTimeout(timer)
  }, []) // 空の依存配列でマウント時のみ実行

  // AI評価設定の変更をlocalStorageに保存
  useEffect(() => {
    if (isInitialized) {
      const settings = {
        isBotGradingEnabled: inputState.isBotGradingEnabled,
        isBotGradingPublic: inputState.isBotGradingPublic,
        isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
        botPersonality: inputState.botPersonality,
        botGradingType: inputState.botGradingType,
      }
      saveBotSettings(settings)
    }
  }, [
    inputState.isBotGradingEnabled,
    inputState.isBotGradingPublic,
    inputState.isBotGradingRankingEnabled,
    inputState.botPersonality,
    inputState.botGradingType,
    isInitialized,
  ])

  const onChangeImageInformation = (imageInformation: PNGInfo) => {
    dispatchInput({
      type: "SET_IMAGE_INFORMATION",
      payload: imageInformation,
    })
  }

  useEffect(() => {
    const processImages = async () => {
      if (viewerData?.viewer?.imageGenerationResults && ref) {
        const base64Urls = await Promise.all(
          viewerData.viewer.imageGenerationResults
            .map((result) =>
              result.imageUrl ? createBase64FromImageURL(result.imageUrl) : "",
            )
            .filter((url) => url !== ""),
        )

        dispatch({
          type: "SET_ITEMS",
          payload: viewerData.viewer.imageGenerationResults.map(
            (_result, index) => ({
              id: index + 1,
              content: base64Urls[index],
            }),
          ),
        })

        dispatch({
          type: "SET_THUMBNAIL_BASE64",
          payload: base64Urls[0],
        })

        const imageUrl =
          viewerData.viewer.imageGenerationResults.length !== 0
            ? viewerData.viewer.imageGenerationResults[0].imageUrl
            : null

        if (!imageUrl) {
          return
        }

        const pngInfo = imageUrl
          ? await getExtractInfoFromBase64(imageUrl)
          : null

        if (pngInfo) {
          pngInfo.params.prompt =
            viewerData.viewer.imageGenerationResults[0].prompt
          pngInfo.params.negativePrompt =
            viewerData.viewer.imageGenerationResults[0].negativePrompt
        }

        dispatchInput({
          type: "SET_IMAGE_INFORMATION",
          payload: pngInfo,
        })

        dispatchInput({
          type: "SET_AI_MODEL_ID",
          payload:
            viewerData.viewer.imageGenerationResults[0].postModelId?.toString() ??
            "",
        })

        dispatch({
          type: "IS_SELECTED_GENERATION_IMAGE",
          payload: true,
        })
      }
    }

    processImages()
  }, [viewerData?.viewer?.imageGenerationResults, dispatch])

  // クエリパラメータからイベント参加情報とタグを処理
  useEffect(() => {
    const eventParam = searchParams.get("event")
    const tagParam = searchParams.get("tag")

    if (eventParam === "wakiaiai4-halloween" && tagParam) {
      // ハロウィン企画参加タグを自動設定
      const decodedTag = decodeURIComponent(tagParam)
      dispatchInput({
        type: "ADD_TAG",
        payload: {
          id: Math.random().toString(),
          text: decodedTag,
        },
      })
    }
  }, [searchParams])

  const [createWork] = useMutation(CreateWorkMutation)
  const [checkWorkByImageHash] = useLazyQuery(WorkByImageHashQuery)

  /**
   * AI生成されたコンテンツをフォームに反映する
   */
  const onContentGenerated = (data: {
    title?: string
    description?: string
    tags?: string[]
    titleEn?: string
    descriptionEn?: string
    tagsEn?: string[]
  }) => {
    // タイトルが設定されている場合は日本語タイトルを設定
    if (data.title && data.title.trim() !== "") {
      dispatchInput({
        type: "SET_TITLE",
        payload: data.title,
      })
    }

    // 英語タイトルが設定されている場合は英語タイトルを設定
    if (data.titleEn && data.titleEn.trim() !== "") {
      dispatchInput({
        type: "SET_EN_TITLE",
        payload: data.titleEn,
      })
    }

    // 説明文が設定されている場合は日本語説明文を設定
    if (data.description && data.description.trim() !== "") {
      dispatchInput({
        type: "SET_CAPTION",
        payload: data.description,
      })
    }

    // 英語説明文が設定されている場合は英語説明文を設定
    if (data.descriptionEn && data.descriptionEn.trim() !== "") {
      dispatchInput({
        type: "SET_EN_CAPTION",
        payload: data.descriptionEn,
      })
    }

    // タグが設定されている場合はタグを追加（上限10個まで）
    if (data.tags && data.tags.length > 0) {
      const currentTagCount = inputState.tags.length
      const maxTags = 10
      let addedCount = 0

      for (const tag of data.tags) {
        if (tag.trim() !== "" && currentTagCount + addedCount < maxTags) {
          // 重複チェック: 既存のタグと重複しないかを確認
          const isDuplicate = inputState.tags.some(
            (existingTag) =>
              existingTag.text.toLowerCase() === tag.trim().toLowerCase(),
          )

          if (!isDuplicate) {
            dispatchInput({
              type: "ADD_TAG",
              payload: {
                id: Math.random().toString(),
                text: tag.trim(),
              },
            })
            addedCount++
          }
        }
      }

      // 上限に達した場合はユーザーに通知
      if (currentTagCount + addedCount >= maxTags) {
        toast.warning(
          "タグの上限は10個までです。一部のタグが追加されませんでした。",
        )
      }
    }

    // 英語タグが設定されている場合は英語タグを追加（上限10個まで）
    if (data.tagsEn && data.tagsEn.length > 0) {
      const currentTagCount = inputState.tags.length
      const maxTags = 10
      let addedCount = 0

      for (const tag of data.tagsEn) {
        if (tag.trim() !== "" && currentTagCount + addedCount < maxTags) {
          // 重複チェック: 既存のタグと重複しないかを確認
          const isDuplicate = inputState.tags.some(
            (existingTag) =>
              existingTag.text.toLowerCase() === tag.trim().toLowerCase(),
          )

          if (!isDuplicate) {
            dispatchInput({
              type: "ADD_TAG",
              payload: {
                id: Math.random().toString(),
                text: tag.trim(),
              },
            })
            addedCount++
          }
        }
      }

      // 上限に達した場合はユーザーに通知
      if (currentTagCount + addedCount >= maxTags) {
        toast.warning(
          "タグの上限は10個までです。一部のタグが追加されませんでした。",
        )
      }
    }
  }

  const formResult = safeParse(vPostImageForm, {
    title: inputState.title,
    caption: inputState.caption,
    enTitle: inputState.enTitle,
    enCaption: inputState.enCaption,
    imagesCount: state.items.length,
    thumbnailBase64: state.thumbnailBase64,
  })

  const uploadImages = async () => {
    if (authContext.userId === null) {
      return []
    }
    const images = state.items.map((item) => item.content)
    const uploads = images.map((image) => {
      if (image === null) {
        return null
      }
      return uploadPublicImage(image, viewerData?.viewer?.token)
    })
    const imageUrls = await Promise.all(uploads)
    return imageUrls
  }

  const onPost = async () => {
    if (authContext.isNotLoggedIn) {
      toast(t("ログインしてください", "Please log in"))
      return
    }

    if (formResult.success === false) {
      for (const issue of formResult.issues) {
        toast(issue.message)
        return
      }
      return
    }

    if (
      inputState.reservationDate !== null &&
      inputState.reservationTime === null
    ) {
      toast(
        t(
          "予約投稿の時間を入力してください",
          "Please enter a time for the scheduled post",
        ),
      )
      return
    }

    if (
      inputState.reservationDate === null &&
      inputState.reservationTime !== null
    ) {
      toast(
        t(
          "予約投稿の時間を入力してください",
          "Please enter a time for the scheduled post",
        ),
      )
      return
    }

    if (inputState.ratingRestriction === null) {
      toast(t("年齢制限を選択してください", "Please select an age restriction"))
      return
    }

    dispatch({ type: "SET_PROGRESS", payload: 5 })

    const MAX_RETRIES = 3
    const uploadedImageUrls: string[] = []

    const performPost = async (retryCount = 0): Promise<void> => {
      try {
        dispatch({ type: "SET_PROGRESS", payload: 10 })

        const smallThumbnail = state.isThumbnailLandscape
          ? await resizeImage(formResult.output.thumbnailBase64, 400, 0, "webp")
          : await resizeImage(formResult.output.thumbnailBase64, 0, 400, "webp")

        dispatch({ type: "SET_PROGRESS", payload: 20 })

        const largeThumbnail = state.isThumbnailLandscape
          ? await resizeImage(formResult.output.thumbnailBase64, 600, 0, "webp")
          : await resizeImage(formResult.output.thumbnailBase64, 0, 600, "webp")

        dispatch({ type: "SET_PROGRESS", payload: 30 })

        // 初回のみ画像をアップロードし、リトライ時は既存のURLを使用
        if (retryCount === 0) {
          const smallThumbnailUrl = await uploadPublicImage(
            smallThumbnail.base64,
            viewerData?.viewer?.token,
          )

          dispatch({ type: "SET_PROGRESS", payload: 40 })

          const largeThumbnailUrl = await uploadPublicImage(
            largeThumbnail.base64,
            viewerData?.viewer?.token,
          )

          dispatch({ type: "SET_PROGRESS", payload: 50 })

          const ogpBase64Url = state.ogpBase64
            ? await uploadPublicImage(
                state.ogpBase64,
                viewerData?.viewer?.token,
              )
            : null

          dispatch({ type: "SET_PROGRESS", payload: 60 })

          // AI評価用のJPEG画像をアップロード
          const botGradingImage = await resizeImage(
            formResult.output.thumbnailBase64,
            400,
            400,
            "jpeg",
          )

          const botGradingImageUrl = await uploadPublicImage(
            botGradingImage.base64,
            viewerData?.viewer?.token,
          )

          const uploadResults = await uploadImages()
          const imageUrls = uploadResults.filter((url) => url !== null)

          if (imageUrls.length === 0) {
            throw new Error(
              t(
                "画像のアップロードに失敗しました",
                "Failed to upload the images",
              ),
            )
          }

          // uploadedImageUrlsに順番に追加
          uploadedImageUrls.push(smallThumbnailUrl)
          uploadedImageUrls.push(largeThumbnailUrl)
          uploadedImageUrls.push(ogpBase64Url || "") // nullの場合は空文字列
          uploadedImageUrls.push(botGradingImageUrl)
          uploadedImageUrls.push(...imageUrls)
        }

        const reservedAt =
          inputState.reservationDate !== null &&
          inputState.reservationTime !== null
            ? new Date(
                `${inputState.reservationDate}T${inputState.reservationTime}`,
              ).getTime() +
              3600000 * 9
            : undefined

        const mainImageSha256 = await sha256(formResult.output.thumbnailBase64)

        const mainImageSize = await getSizeFromBase64(
          formResult.output.thumbnailBase64,
        )

        dispatch({ type: "SET_PROGRESS", payload: 70 })

        // リトライ時は先にworkByImageHashで作品の存在確認
        if (retryCount > 0) {
          try {
            const { data: existingWorkData } = await checkWorkByImageHash({
              variables: { imageHash: mainImageSha256 },
            })

            const existingWork = existingWorkData?.workByImageHash as {
              id: string
              uuid: string | null
            } | null
            if (existingWork?.id) {
              // 作品が既に存在する場合は成功として扱う
              dispatch({
                type: "MARK_AS_DONE",
                payload: {
                  uploadedWorkId: existingWork.id,
                  uploadedWorkUuid: existingWork.uuid || null,
                },
              })

              toast(t("作品を投稿しました", "Work has been posted"))
              return
            }
          } catch (error) {
            // workByImageHashでエラーが発生した場合は無視して続行
            console.warn(
              "workByImageHash query failed, continuing with post:",
              error,
            )
          }
        }

        const work = await createWork({
          variables: {
            input: {
              title: formResult.output.title,
              entitle: formResult.output.enTitle,
              explanation: formResult.output.caption,
              enExplanation: formResult.output.enCaption,
              rating: inputState.ratingRestriction as
                | "G"
                | "R15"
                | "R18"
                | "R18G",
              prompt: inputState.imageInformation?.params.prompt ?? null,
              negativePrompt:
                inputState.imageInformation?.params.negativePrompt ?? null,
              seed:
                inputState.imageInformation?.params.seed?.toString() ?? null,
              sampler:
                inputState.imageInformation?.params.sampler?.toString() ?? null,
              strength:
                inputState.imageInformation?.params.strength?.toString() ??
                null,
              noise:
                inputState.imageInformation?.params.noise?.toString() ?? null,
              modelName: inputState.imageInformation?.params.model ?? null,
              modelHash:
                inputState.imageInformation?.params.modelHash?.toString() ??
                null,
              otherGenerationParams: null,
              pngInfo: inputState.imageInformation?.src ?? null,
              imageStyle: inputState.imageStyle,
              relatedUrl: inputState.link,
              tags: inputState.tags.map((tag) => tag.text),
              isTagEditable: inputState.useTagFeature,
              isCommentEditable: inputState.useCommentFeature,
              thumbnailPosition: state.isThumbnailLandscape
                ? state.thumbnailPosX
                : state.thumbnailPosY,
              modelId: inputState.aiModelId,
              type: "WORK",
              subjectId: inputState.themeId,
              albumId: inputState.albumId,
              isPromotion: inputState.usePromotionFeature,
              reservedAt: reservedAt,
              mainImageSha256: mainImageSha256,
              accessType: inputState.accessType,
              imageUrls: uploadedImageUrls.slice(4), // 最初の4つを除外（thumbnails, ogp, botGradingImage）
              smallThumbnailImageURL: uploadedImageUrls[0],
              smallThumbnailImageWidth: smallThumbnail.width,
              smallThumbnailImageHeight: smallThumbnail.height,
              largeThumbnailImageURL: uploadedImageUrls[1],
              largeThumbnailImageWidth: largeThumbnail.width,
              largeThumbnailImageHeight: largeThumbnail.height,
              videoUrl: null,
              ogpImageUrl:
                uploadedImageUrls[2] !== "" ? uploadedImageUrls[2] : null,
              imageHeight: mainImageSize.height,
              imageWidth: mainImageSize.width,
              accessGenerationType:
                state.isSelectedGenerationImage &&
                inputState.useGenerationParams
                  ? "PUBLIC_RESTORABLE"
                  : inputState.useGenerationParams
                    ? "PUBLIC"
                    : "PRIVATE",
              isBotGradingEnabled: inputState.isBotGradingEnabled,
              isBotGradingPublic: inputState.isBotGradingPublic,
              isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
              botPersonality: inputState.botPersonality,
              botGradingImageUrl: uploadedImageUrls[3],
              botGradingType: inputState.botGradingType,
            },
          },
        })

        if (work.data?.createWork === undefined) {
          throw new Error(
            t("作品の投稿に失敗しました", "Failed to post the work"),
          )
        }

        dispatch({
          type: "MARK_AS_DONE",
          payload: {
            uploadedWorkId: work.data?.createWork.id,
            uploadedWorkUuid: work.data?.createWork.uuid,
          },
        })

        toast(t("作品を投稿しました", "Work has been posted"))
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          // リトライ前に少し待機
          const waitTime = 2 ** retryCount * 1000 // 指数バックオフ: 1秒, 2秒, 4秒
          toast(
            t(
              `投稿に失敗しました。${waitTime / 1000}秒後にリトライします...`,
              `Post failed. Retrying in ${waitTime / 1000} seconds...`,
            ),
          )

          setTimeout(() => {
            performPost(retryCount + 1)
          }, waitTime)
        } else {
          // 最大リトライ回数に達した場合は画像を削除
          if (error instanceof Error) {
            toast(error.message)
          }
          const promises = uploadedImageUrls.map((url) => {
            return deleteUploadedImage(url)
          })
          await Promise.all(promises)
          dispatch({ type: "SET_PROGRESS", payload: 0 })
        }
      }
    }

    await performPost()
  }

  const createdAt = new Date(
    `${inputState.reservationDate}T${inputState.reservationTime}`,
  )

  const onInputFiles = async (_files: FileList) => {
    // if (inputState.ratingRestriction !== "G") {
    //   return
    // }
    // // AI判定処理
    // dispatch({ type: "OPEN_LOADING_AI", payload: true })
    // const fileArray = Array.from(files)
    // const results = await Promise.all(
    //   fileArray.map(async (file) => {
    //     try {
    //       const nsfwInfo = await getNsfwPredictions(file)
    //       return nsfwInfo
    //     } catch (error) {
    //       console.error("Error processing NSFW predictions:", error)
    //       return null
    //     }
    //   }),
    // )
    // const validResults = results.filter(
    //   (nsfwInfo) => nsfwInfo !== null,
    // ) as NsfwResults[]
    // const mostSuitableStyle = validResults.reduce(
    //   (currentStyle, nsfwInfo) => {
    //     if (nsfwInfo.drawings >= 0.7) {
    //       return "ILLUSTRATION"
    //     }
    //     if (nsfwInfo.drawings >= 0.5) {
    //       return "SEMI_REAL"
    //     }
    //     return "REAL"
    //   },
    //   "ILLUSTRATION" as "ILLUSTRATION" | "REAL" | "SEMI_REAL",
    // )
    // const strictestRating = validResults.reduce(
    //   (currentRating, nsfwInfo) => {
    //     const newRating =
    //       nsfwInfo.hentai >= 0.7
    //         ? "R18"
    //         : nsfwInfo.hentai >= 0.05 ||
    //             nsfwInfo.porn >= 0.5 ||
    //             nsfwInfo.sexy >= 0.8
    //           ? "R15"
    //           : "G"
    //     if (
    //       inputState.ratingRestriction === "R18G" ||
    //       inputState.ratingRestriction === "R18"
    //     ) {
    //       return inputState.ratingRestriction
    //     }
    //     return newRating === "R18" ||
    //       (newRating === "R15" && currentRating === "G")
    //       ? newRating
    //       : currentRating
    //   },
    //   "G" as "G" | "R15" | "R18" | "R18G",
    // )
    // dispatchInput({ type: "SET_RATING_RESTRICTION", payload: strictestRating })
    // dispatchInput({ type: "SET_IMAGE_STYLE", payload: mostSuitableStyle })
    // dispatch({ type: "OPEN_LOADING_AI", payload: false })
  }

  // ユーザーが実際に作品投稿に関する入力をしているかチェックする関数
  const hasUserInput = useCallback(() => {
    return (
      state.thumbnailBase64 !== null ||
      inputState.title.trim() !== "" ||
      inputState.caption.trim() !== "" ||
      inputState.enTitle.trim() !== "" ||
      inputState.enCaption.trim() !== "" ||
      inputState.tags.length > 0 ||
      state.items.length > 0 ||
      inputState.link.trim() !== "" ||
      inputState.reservationDate !== null ||
      inputState.reservationTime !== null
    )
  }, [
    state.thumbnailBase64,
    state.items.length,
    inputState.title,
    inputState.caption,
    inputState.enTitle,
    inputState.enCaption,
    inputState.tags.length,
    inputState.link,
    inputState.reservationDate,
    inputState.reservationTime,
  ])

  // ブラウザ離脱時の確認ダイアログ（リロード・タブ閉じる・外部サイトへの遷移）
  useBeforeUnload(
    useCallback(
      (event) => {
        if (hasUserInput()) {
          const confirmationMessage = t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure you want to leave this page? Your changes will be lost.",
          )
          event.returnValue = confirmationMessage
          return confirmationMessage
        }
      },
      [hasUserInput, t],
    ),
  )

  // Reactコンポーネントのunmount時の警告（アプリ内ページ遷移）
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUserInput()) {
        const confirmationMessage = t(
          "ページ遷移すると変更が消えますが問題無いですか？",
          "Are you sure you want to leave this page? Your changes will be lost.",
        )
        event.returnValue = confirmationMessage
        return confirmationMessage
      }
    }

    // カスタムイベントリスナーでルート変更を検知
    const handleRouteChange = () => {
      if (hasUserInput()) {
        const shouldProceed = window.confirm(
          t(
            "ページ遷移すると変更が消えますが問題無いですか？",
            "Are you sure you want to leave this page? Your changes will be lost.",
          ),
        )

        if (!shouldProceed) {
          // ユーザーがキャンセルした場合、履歴を一つ戻す
          window.history.pushState(null, "", window.location.href)
        }
      }
    }

    // popstateイベント（ブラウザの戻る/進むボタン）をリッスン
    window.addEventListener("popstate", handleRouteChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("popstate", handleRouteChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUserInput, t])

  // 認証状態が読み込み中でない場合は、ページを表示する
  const showPage = authContext.isNotLoading

  if (!showPage) {
    return (
      <div className="m-auto w-full max-w-[1200px] space-y-4 bg-white pb-4 dark:bg-gray-900">
        <p className="text-center font-bold text-gray-800 text-md dark:text-gray-200">
          {t("認証状態を確認中です", "Checking authentication status...")}
        </p>
      </div>
    )
  }

  return (
    <div className="m-auto w-full max-w-[1200px] space-y-4 bg-white pb-4 dark:bg-gray-900">
      <div className="max-w-[1200px] space-y-4">
        {loading && authContext.isLoggedIn && (
          <p className="text-center font-bold text-gray-800 text-md dark:text-gray-200">
            {t(
              "読み込み中です、完了まで操作しないようにご注意ください",
              "Loading, please be patient",
            )}
          </p>
        )}

        {authContext.isNotLoggedIn && (
          <p className="text-center font-bold text-gray-800 text-md dark:text-gray-200">
            {t(
              "ログインすると投稿できるようになります",
              "Log in to post your work",
            )}
          </p>
        )}
        <div className="relative">
          <PostFormHeader type="image" />
          {state.isOpenLoadingAi && (
            <div className="absolute top-12 right-2 z-10 flex items-center space-x-2 opacity-80">
              <Loader2Icon className="size-4 animate-spin text-white" />
              <p className="text-white">
                {t(
                  "AIでテイスト、年齢種別を判定中",
                  "Analyzing the image for style and age restrictions using AI",
                )}
              </p>
            </div>
          )}
          <PostImageFormUploader
            onChangeImageInformation={onChangeImageInformation}
            state={state}
            dispatch={dispatch}
            onInputFiles={onInputFiles}
            token={viewerData?.viewer?.token}
            onContentGenerated={onContentGenerated}
          />
        </div>
        <PostImageFormInput
          imageInformation={inputState.imageInformation}
          state={inputState}
          dispatch={dispatchInput}
          albums={viewerData?.albums ?? []}
          currentPass={viewerData?.viewer?.currentPass ?? null}
          recentlyUsedTags={viewerData?.viewer?.recentlyUsedTags ?? []}
          themes={
            viewer?.dailyThemes
              ? viewer.dailyThemes.map((theme) => ({
                  date: theme.dateText,
                  title: theme.title,
                  id: theme.id,
                }))
              : null
          }
          aiModels={viewerData?.aiModels ?? []}
          events={viewer?.appEvents ?? []}
          needFix={false}
          imageBase64={state.thumbnailBase64}
          token={viewerData?.viewer?.token}
          onContentGenerated={onContentGenerated}
        />
        <div className="h-4" />
        <Button
          className="fixed bottom-0 left-0 z-30 ml-0 w-full rounded-none p-0 md:ml-[72px] md:pr-[72px] lg:ml-[224px] lg:pr-[224px] xl:left-auto xl:m-0 xl:max-w-[1200px] xl:pl-[8%]"
          size={"lg"}
          type="submit"
          onClick={onPost}
        >
          {t("投稿", "Post")}
        </Button>
      </div>
      <SuccessCreatedWorkDialog
        isOpen={state.progress === 100}
        title={inputState.title}
        description={inputState.caption}
        imageBase64={state.thumbnailBase64}
        workId={state.uploadedWorkId}
        uuid={state.uploadedWorkUuid}
        shareTags={["Aipictors", "AIイラスト", "AIart"]}
        createdAt={createdAt.getTime()}
        accessType={inputState.accessType}
      />
      <CreatingWorkDialog
        progress={state.progress}
        isOpen={state.progress !== 0 && state.progress !== 100}
      />
    </div>
  )
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_IMAGE, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const now = getJstDate(new Date())

  const afterDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const result = await loaderClient.query({
    query: ViewerQuery,
    variables: {
      offset: 0,
      limit: 128,
      ownerUserId: "-1",
      generationLimit: 64,
      generationOffset: 0,
      generationWhere: {
        nanoids: [],
      },
      startAt: now.toISOString().split("T")[0],
      startDate: now.toISOString().split("T")[0],
      endDate: afterDate.toISOString().split("T")[0],
    },
  })

  return {
    ...result.data,
  }
}

export const headers: HeadersFunction = () => ({
  // 投稿画面なのでキャッシュは不要
  // "Cache-Control": config.cacheControl.oneHour,
})

const ViewerQuery = graphql(
  `query ViewerQuery(
    $limit: Int!,
    $offset: Int!,
    $ownerUserId: ID
    $generationOffset: Int!
    $generationLimit: Int!
    $generationWhere: ImageGenerationResultsWhereInput
    $startAt: String
    $startDate: String
    $endDate: String
  ) {
    viewer {
      id
      token
      currentPass {
        ...PostImageFormPass
      }
      recentlyUsedTags {
        ...PostImageFormRecentlyUsedTags
      }
      imageGenerationResults(offset: $generationOffset, limit: $generationLimit, where: $generationWhere) {
        id
        prompt
        negativePrompt
        seed
        steps
        scale
        sampler
        clipSkip
        sizeType
        t2tImageUrl
        t2tMaskImageUrl
        t2tDenoisingStrengthSize
        t2tInpaintingFillSize
        rating
        completedAt
        isProtected
        generationType
        postModelId
        modelHash
        model {
          id
          name
          type
        }
        vae
        nanoid
        status
        estimatedSeconds
        controlNetControlMode
        controlNetEnabled
        controlNetGuidanceEnd
        controlNetGuidanceStart
        controlNetPixelPerfect
        controlNetProcessorRes
        controlNetResizeMode
        controlNetThresholdA
        controlNetThresholdB
        controlNetWeight
        controlNetModule
        controlNetModel
        controlNetSaveDetectedMap
        controlNetHrOption
        upscaleSize
        imageUrl
        thumbnailUrl
      }
    }
    albums(
      offset: $offset,
      limit: $limit,
      where: {
        ownerUserId: $ownerUserId,
        needInspected: false,
        needsThumbnailImage: false,
      }
    ) {
      ...PostImageFormAlbum
    }
    aiModels(offset: 0, limit: 124, where: {}) {
      id
      ...PostImageFormAiModel
    }
    dailyThemes(
      limit: 8,
      offset: 0,
      where: {
        startDate: $startDate,
        endDate: $endDate,
      }) {
      id
      title
      dateText
    }
    appEvents(
      limit: 8,
      offset: 0,
      where: {
        endAt: $startAt,
      }
    ) {
      id
      description
      title
      tag
      slug
      endAt
    }
  }`,
  [
    PostImageFormAiModelFragment,
    PostImageFormAlbumFragment,
    PostImageFormPassFragment,
    PostImageFormRecentlyUsedTagsFragment,
  ],
)

const CreateWorkMutation = graphql(
  `mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      id
      title
      accessType
      nanoid
      uuid
    }
  }`,
)

const WorkByImageHashQuery = graphql(
  `query WorkByImageHash($imageHash: String!) {
    workByImageHash(imageHash: $imageHash) {
      id
      title
      accessType
      nanoid
      uuid
    }
  }`,
)
