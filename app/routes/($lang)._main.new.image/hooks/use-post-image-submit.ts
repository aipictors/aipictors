import { useLazyQuery, useMutation } from "@apollo/client/index"
import type { Dispatch, MutableRefObject } from "react"
import { toast } from "sonner"
import type { SafeParseResult } from "valibot"
import type { TranslationFn } from "~/hooks/use-translation"
import {
  pickupVerifyMessage,
  verifyPickupByGeneration,
  verifyPickupByPngInfo,
} from "~/lib/user-models/pickup-verify"
import type { UserModelPickup } from "~/lib/user-models/types"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import {
  CreateWorkMutation,
  LinkWorkToGenerationsMutation,
  WorkByImageHashQuery,
} from "~/routes/($lang)._main.new.image/utils/new-image-queries"
import {
  countSensitivePostImages,
  finalizePostMosaic,
  isAutoMosaicRating,
} from "~/routes/($lang)._main.new.image/utils/post-auto-mosaic"
import {
  type EventOption,
  getPostEventPeriodError,
  toPostReservedAt,
} from "~/routes/($lang)._main.new.image/utils/post-form-event"
import { clearPersistedPostDrafts } from "~/routes/($lang)._main.new.image/utils/post-image-draft"
import {
  toImageWorkInput,
  toVideoWorkInput,
} from "~/routes/($lang)._main.new.image/utils/post-image-work-input"
import {
  readPostMosaicSelfApplied,
  readPostMosaicSettings,
} from "~/routes/($lang)._main.new.image/utils/post-mosaic-store"
import type { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeImage, resizeThumbnail } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { uploadPublicVideo } from "~/utils/upload-public-video"

type Props = {
  state: PostImageFormState
  inputState: PostImageFormInputState
  dispatch: Dispatch<PostImageFormAction>
  mediaType: "image" | "video"
  events: EventOption[]
  formResult: SafeParseResult<typeof vPostImageForm>
  token: string | null | undefined
  userId: string | null
  isNotLoggedIn: boolean
  isPostingRef: MutableRefObject<boolean>
  t: TranslationFn
  /** 今週のピックアップモデル（お題のタグを付けた投稿は、そのモデルで作った画像か確かめる） */
  pickup?: UserModelPickup | null
  /** 生成画面から渡された生成結果がピックアップモデルを使っているか */
  generationUsesPickup?: boolean
  /** 投稿の段階が変わったとき（処理中・完了の表示に使う） */
  onStageChange?: (stage: PostStage) => void
  /** 全年齢・R15 の画像に性器が写っていて、R18 に変えて投稿するとき */
  onRatingChangeToR18?: () => void
}

/** 投稿の段階（処理中・完了の画面に出す） */
export type PostStage =
  | { kind: "idle" }
  | {
      kind: "mosaic"
      done: number
      total: number
      preview: string | null
      /** 全年齢・R15 の投稿で、性器が写っていないか確かめている */
      isChecking?: boolean
    }
  | { kind: "upload" }
  | { kind: "create" }
  | {
      kind: "done"
      /** 自動でモザイクをかけた画像の枚数（R18 のみ） */
      mosaicImageCount: number | null
      /** 投稿した作品のサムネイル（モザイク後） */
      thumbnail: string | null
      /** 性器が写っていたので、全年齢・R15 から R18 に変えて投稿した */
      isRatingChangedToR18?: boolean
    }

/**
 * ピックアップモデルのお題のタグが付いているとき、そのモデルで作った画像か確かめる（参加できなければ案内の文）
 * - 生成機から選んだ画像: 生成履歴のプロンプト・モデル名
 * - アップロードした画像: PNG に書かれたハッシュ（書き換えられる欄ではなく、読み込んだときの元の文）
 */
export const getPickupJoinError = (props: {
  pickup: UserModelPickup | null | undefined
  tags: PostImageFormInputState["tags"]
  imageInformation: PostImageFormInputState["imageInformation"]
  isSelectedGenerationImage: boolean
  generationUsesPickup?: boolean
  mediaType: "image" | "video"
}): string | null => {
  const { pickup } = props
  if (!pickup?.eventTag || !pickup.model) return null
  if (!props.tags.some((tag) => tag.text === pickup.eventTag)) return null
  if (props.mediaType === "video") return pickupVerifyMessage(pickup, "NO_INFO")
  if (props.isSelectedGenerationImage) {
    if (props.generationUsesPickup) return null
    const params = props.imageInformation?.params
    if (
      verifyPickupByGeneration(pickup.model, {
        prompt: params?.prompt,
        modelName: params?.model,
      })
    ) {
      return null
    }
  }
  const result = verifyPickupByPngInfo(
    pickup.model,
    props.imageInformation?.src ?? null,
  )
  return result.ok ? null : pickupVerifyMessage(pickup, result.reason)
}

/**
 * 作品の投稿（画像・動画）
 */
export function usePostImageSubmit(props: Props) {
  const {
    state,
    inputState,
    dispatch,
    mediaType,
    events,
    formResult,
    token,
    userId,
    isNotLoggedIn,
    isPostingRef,
    t,
    pickup,
    generationUsesPickup,
    onStageChange,
    onRatingChangeToR18,
  } = props

  const setStage = (stage: PostStage) => onStageChange?.(stage)

  const [createWork] = useMutation(CreateWorkMutation)
  const [linkWorkToGenerations] = useMutation(LinkWorkToGenerationsMutation)
  const [checkWorkByImageHash] = useLazyQuery(WorkByImageHashQuery, {
    // 前回のリトライで「なし」だった結果をキャッシュから返さない
    fetchPolicy: "network-only",
  })

  const uploadImages = async (images: (string | null)[]) => {
    if (userId === null) {
      return []
    }
    // 全部を同時に送ると回線を分け合って 1 枚ごとが遅くなり、モバイル通信ではタイムアウトしやすい。
    // 2 枚ずつ送る
    const imageUrls: (string | null)[] = new Array(images.length).fill(null)
    let next = 0
    const worker = async () => {
      while (next < images.length) {
        const index = next++
        const image = images[index]
        if (image !== null) {
          imageUrls[index] = await uploadPublicImage(image, token)
        }
      }
    }
    await Promise.all([worker(), worker()])
    return imageUrls
  }

  const uploadVideo = async () => {
    if (state.videoFile === null) {
      return null
    }

    return uploadPublicVideo(state.videoFile as File, token)
  }

  const onPost = async () => {
    if (isPostingRef.current) {
      return
    }

    if (isNotLoggedIn) {
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

    const eventPeriodError = getPostEventPeriodError({
      tags: inputState.tags,
      events,
      reservationDate: inputState.reservationDate,
      reservationTime: inputState.reservationTime,
      t,
    })

    if (eventPeriodError !== null) {
      toast(eventPeriodError)
      return
    }

    const pickupJoinError = getPickupJoinError({
      pickup,
      tags: inputState.tags,
      imageInformation: inputState.imageInformation,
      isSelectedGenerationImage: state.isSelectedGenerationImage,
      generationUsesPickup,
      mediaType,
    })

    if (pickupJoinError !== null) {
      toast(pickupJoinError, { duration: 10000 })
      return
    }

    if (
      inputState.ratingRestriction === null ||
      inputState.ratingRestriction === undefined
    ) {
      toast(t("年齢制限を選択してください", "Please select an age restriction"))
      return
    }

    if (mediaType === "video" && state.videoFile === null) {
      toast(t("動画ファイルを選択してください", "Please select a video file"))
      return
    }

    if (mediaType === "image" && state.items.length === 0) {
      toast(t("画像を選択してください", "Please select at least one image"))
      return
    }

    isPostingRef.current = true

    const finishPosting = () => {
      isPostingRef.current = false
    }

    if (mediaType === "video") {
      const uploadedImageUrls: string[] = []

      try {
        setStage({ kind: "upload" })
        dispatch({ type: "SET_PROGRESS", payload: 10 })

        const smallThumbnail = await resizeThumbnail(
          formResult.output.thumbnailBase64,
          400,
          1200,
          "webp",
        )

        dispatch({ type: "SET_PROGRESS", payload: 20 })

        const largeThumbnail = await resizeThumbnail(
          formResult.output.thumbnailBase64,
          600,
          1600,
          "webp",
        )

        dispatch({ type: "SET_PROGRESS", payload: 30 })

        const thumbnailUrl = await uploadPublicImage(
          formResult.output.thumbnailBase64,
          token,
        )

        dispatch({ type: "SET_PROGRESS", payload: 40 })
        uploadedImageUrls.push(thumbnailUrl)

        const smallThumbnailUrl = await uploadPublicImage(
          smallThumbnail.base64,
          token,
        )

        dispatch({ type: "SET_PROGRESS", payload: 45 })
        uploadedImageUrls.push(smallThumbnailUrl)

        const largeThumbnailUrl = await uploadPublicImage(
          largeThumbnail.base64,
          token,
        )

        dispatch({ type: "SET_PROGRESS", payload: 50 })
        uploadedImageUrls.push(largeThumbnailUrl)

        const ogpBase64Url = state.ogpBase64
          ? await uploadPublicImage(state.ogpBase64, token)
          : null

        dispatch({ type: "SET_PROGRESS", payload: 60 })

        if (ogpBase64Url !== null) {
          uploadedImageUrls.push(ogpBase64Url)
        }

        const reservedAt = toPostReservedAt(
          inputState.reservationDate,
          inputState.reservationTime,
        )

        const mainImageSha256 = await sha256(formResult.output.thumbnailBase64)
        const mainImageSize = await getSizeFromBase64(
          formResult.output.thumbnailBase64,
        )

        dispatch({ type: "SET_PROGRESS", payload: 70 })

        const uploadedVideo = await uploadVideo()

        if (!uploadedVideo) {
          throw new Error(
            t("動画のアップロードに失敗しました", "Failed to upload the video"),
          )
        }

        setStage({ kind: "create" })
        const work = await createWork({
          variables: {
            input: toVideoWorkInput({
              form: formResult.output,
              inputState,
              state,
              reservedAt,
              mainImageSha256,
              mainImageSize,
              thumbnailUrl,
              smallThumbnail,
              smallThumbnailUrl,
              largeThumbnail,
              largeThumbnailUrl,
              ogpBase64Url,
              uploadedVideo,
            }),
          },
        })

        if (work.data?.createWork === undefined) {
          throw new Error(
            t("作品の投稿に失敗しました", "Failed to post the work"),
          )
        }

        // 生成履歴に「投稿済み」の印を付ける（失敗しても投稿には関係ない）
        const generationNanoidsOfWork = state.items.flatMap((item) =>
          item.generationNanoid ? [item.generationNanoid] : [],
        )
        if (generationNanoidsOfWork.length > 0) {
          void linkWorkToGenerations({
            variables: {
              workId: work.data.createWork.id,
              generationNanoids: generationNanoidsOfWork,
            },
          }).catch(() => {})
        }

        setStage({
          kind: "done",
          mosaicImageCount: null,
          thumbnail: formResult.output.thumbnailBase64,
        })
        dispatch({
          type: "MARK_AS_DONE",
          payload: {
            uploadedWorkId: work.data.createWork.id,
            uploadedWorkUuid: work.data.createWork.uuid,
          },
        })

        await clearPersistedPostDrafts()
      } catch (error) {
        if (error instanceof Error) {
          toast(error.message)
        }

        await Promise.all(
          uploadedImageUrls.map((url) => deleteUploadedImage(url)),
        )
        dispatch({ type: "SET_PROGRESS", payload: 0 })
        setStage({ kind: "idle" })
      } finally {
        finishPosting()
      }

      return
    }

    dispatch({ type: "SET_PROGRESS", payload: 5 })

    // 全年齢・R15: 性器・肛門が写っていたら、R18 に変えて自動でモザイクをかけるか聞く
    // （年齢種別を選び忘れて、モザイクなしで投稿されてしまうのを防ぐ）
    let postInputState = inputState
    let isRatingChangedToR18 = false
    if (!isAutoMosaicRating(inputState.ratingRestriction)) {
      setStage({
        kind: "mosaic",
        done: 0,
        total: 0,
        preview: null,
        isChecking: true,
      })
      const sensitiveCount = await countSensitivePostImages(
        state.items,
        (progress) =>
          setStage({ kind: "mosaic", ...progress, isChecking: true }),
      )
      if (sensitiveCount > 0) {
        if (
          window.confirm(
            t(
              `${sensitiveCount}枚に性器などが写っているようです。年齢種別を「R-18」に変えて、自動でモザイクをかけて投稿しますか？\n（キャンセルすると、全年齢のまま投稿するか選べます）`,
              `${sensitiveCount} image(s) seem to show genitals. Change the age rating to R-18 and post with an automatic mosaic?\n(Cancel to choose whether to post with the current rating)`,
            ),
          )
        ) {
          postInputState = { ...inputState, ratingRestriction: "R18" }
          isRatingChangedToR18 = true
          onRatingChangeToR18?.()
        } else if (
          !window.confirm(
            t(
              "今の年齢種別のまま、モザイクなしで投稿しますか？\n（性器が写っている作品を全年齢で投稿すると、非公開になることがあります）",
              "Post with the current age rating and no mosaic?\n(Works showing genitals posted as all ages may be hidden)",
            ),
          )
        ) {
          setStage({ kind: "idle" })
          dispatch({ type: "SET_PROGRESS", payload: 0 })
          finishPosting()
          return
        }
      }
    }

    // R18 / R18G: プレビューでかけたモザイクを確かめて仕上げる（性器・肛門。乳首は対象外）
    let imageContents = state.items.map((item) => item.content)
    let thumbnailBase64 = formResult.output.thumbnailBase64
    let ogpBase64 = state.ogpBase64
    let mosaicImageCount: number | null = null

    if (isAutoMosaicRating(postInputState.ratingRestriction)) {
      setStage({ kind: "mosaic", done: 0, total: 0, preview: null })
      // R18 に変えたばかりの投稿は「自分でかけ済み」の設定を使わず、自動でかける
      const isSelfApplied = isRatingChangedToR18
        ? false
        : readPostMosaicSelfApplied()
      const mosaicked = await finalizePostMosaic({
        items: state.items,
        thumbnailBase64,
        ogpBase64,
        isSelfApplied,
        settings: readPostMosaicSettings(),
        onProgress: (progress) => {
          setStage({ kind: "mosaic", ...progress })
          // 5〜25% をモザイクの進み具合に使う
          const ratio = progress.total > 0 ? progress.done / progress.total : 1
          dispatch({
            type: "SET_PROGRESS",
            payload: Math.max(5, Math.round(5 + ratio * 20)),
          })
        },
      })
      if (
        mosaicked.failedCount > 0 &&
        !window.confirm(
          t(
            `${mosaicked.failedCount}枚に自動モザイクをかけられませんでした。このまま投稿しますか？\n（キャンセルして、各画像の鉛筆ボタンから手でかけることもできます）`,
            `Auto mosaic failed on ${mosaicked.failedCount} image(s). Post anyway?\n(Cancel to add mosaics by hand with the pencil button)`,
          ),
        )
      ) {
        setStage({ kind: "idle" })
        dispatch({ type: "SET_PROGRESS", payload: 0 })
        finishPosting()
        return
      }
      // 自分でかけ済み: 検出は回していて、隠れていないように見える所があれば確かめる
      if (
        mosaicked.warningCount > 0 &&
        !window.confirm(
          t(
            `${mosaicked.warningCount}枚で、性器などが隠れていないように見える所が見つかりました。このまま投稿しますか？\n（キャンセルして、⚠の画像を鉛筆ボタンで直すか、「⚠の画像に自動でかける」を押してください。修正が足りない作品は非公開になることがあります）`,
            `${mosaicked.warningCount} image(s) may have uncensored areas. Post anyway?\n(Cancel to fix the images marked ⚠. Works without sufficient censoring may be hidden)`,
          ),
        )
      ) {
        setStage({ kind: "idle" })
        dispatch({ type: "SET_PROGRESS", payload: 0 })
        finishPosting()
        return
      }
      imageContents = mosaicked.contents
      thumbnailBase64 = mosaicked.thumbnailBase64
      ogpBase64 = mosaicked.ogpBase64
      mosaicImageCount = mosaicked.mosaicImageCount
    }

    setStage({ kind: "upload" })

    const MAX_RETRIES = 3
    const uploadedImageUrls: string[] = []

    const failPost = async (error: unknown) => {
      if (error instanceof Error) {
        toast(error.message)
      }
      await Promise.all(
        uploadedImageUrls.map((url) => deleteUploadedImage(url)),
      )
      dispatch({ type: "SET_PROGRESS", payload: 0 })
      setStage({ kind: "idle" })
      finishPosting()
    }

    const completePost = async (
      uploadedWorkId: string,
      uploadedWorkUuid: string | null,
    ) => {
      setStage({
        kind: "done",
        mosaicImageCount,
        thumbnail: thumbnailBase64,
        isRatingChangedToR18,
      })
      dispatch({
        type: "MARK_AS_DONE",
        payload: { uploadedWorkId, uploadedWorkUuid },
      })

      await clearPersistedPostDrafts()

      finishPosting()
    }

    // アップロードは 1 回だけ。失敗したら作品を作らずに終える（投稿し直せばやり直せる）
    let prepared: Pick<
      Parameters<typeof toImageWorkInput>[0],
      | "reservedAt"
      | "mainImageSha256"
      | "mainImageSize"
      | "smallThumbnail"
      | "largeThumbnail"
    >

    try {
      dispatch({ type: "SET_PROGRESS", payload: 30 })

      // 順番に待たない（1 枚ずつ往復すると画像の数だけ投稿が遅くなる）
      const [smallThumbnail, largeThumbnail, botGradingImage] =
        await Promise.all([
          resizeThumbnail(thumbnailBase64, 400, 1200, "webp"),
          resizeThumbnail(thumbnailBase64, 600, 1600, "webp"),
          // AI評価用のJPEG画像
          resizeImage(thumbnailBase64, 400, 400, "jpeg"),
        ])

      dispatch({ type: "SET_PROGRESS", payload: 45 })

      // 順に小サムネイル・大サムネイル・OGP（なければ空文字）・AI 評価用
      const [thumbnails, images] = await Promise.all([
        Promise.allSettled(
          [
            smallThumbnail.base64,
            largeThumbnail.base64,
            ogpBase64,
            botGradingImage.base64,
          ].map((base64) => (base64 ? uploadPublicImage(base64, token) : "")),
        ),
        uploadImages(imageContents)
          .then((value) => ({ ok: true as const, value }))
          .catch((reason: unknown) => ({ ok: false as const, reason })),
      ])

      const thumbnailUrls = thumbnails.flatMap((result) =>
        result.status === "fulfilled" ? [result.value] : [],
      )
      const failedThumbnail = thumbnails.find(
        (result) => result.status === "rejected",
      )

      // 途中で失敗しても、届いた分は failPost で消せるように覚える
      uploadedImageUrls.push(...thumbnailUrls)

      if (failedThumbnail !== undefined) {
        throw failedThumbnail.reason
      }
      if (!images.ok) {
        throw images.reason
      }

      const uploadResults = images.value
      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        throw new Error(
          t("画像のアップロードに失敗しました", "Failed to upload the images"),
        )
      }

      uploadedImageUrls.push(...imageUrls)

      prepared = {
        reservedAt: toPostReservedAt(
          postInputState.reservationDate,
          postInputState.reservationTime,
        ),
        mainImageSha256: await sha256(thumbnailBase64),
        mainImageSize: await getSizeFromBase64(thumbnailBase64),
        smallThumbnail,
        largeThumbnail,
      }

      dispatch({ type: "SET_PROGRESS", payload: 70 })
      setStage({ kind: "create" })
    } catch (error) {
      await failPost(error)
      return
    }

    // 作品の作成だけをリトライする
    const performPost = async (retryCount = 0): Promise<void> => {
      try {
        console.log(
          `[投稿処理] リトライ回数: ${retryCount}, rating: ${postInputState.ratingRestriction}`,
        )

        // 前回の createWork は応答が返らなかっただけで届いていることがある。
        // 作品の有無を確かめられないときは送らない（二重に作らない）
        if (retryCount > 0) {
          const { data, error } = await checkWorkByImageHash({
            variables: { imageHash: prepared.mainImageSha256 },
          })

          if (error !== undefined) {
            throw error
          }

          const existingWork = data?.workByImageHash

          // 同じハッシュの他人の作品は今回の投稿ではない（createWork が重複として断る）
          if (existingWork && existingWork.user?.id === userId) {
            await completePost(existingWork.id, existingWork.uuid)
            return
          }
        }

        const work = await createWork({
          variables: {
            input: toImageWorkInput({
              form: formResult.output,
              inputState: postInputState,
              state,
              ...prepared,
              uploadedImageUrls,
            }),
          },
        })

        if (work.data?.createWork === undefined) {
          throw new Error(
            t("作品の投稿に失敗しました", "Failed to post the work"),
          )
        }

        await completePost(work.data.createWork.id, work.data.createWork.uuid)
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
          await failPost(error)
        }
      }
    }

    await performPost()
  }

  return onPost
}
