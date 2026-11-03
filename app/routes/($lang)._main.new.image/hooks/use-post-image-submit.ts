import { useLazyQuery, useMutation } from "@apollo/client/index"
import type { Dispatch, MutableRefObject } from "react"
import { toast } from "sonner"
import type { SafeParseResult } from "valibot"
import type { TranslationFn } from "~/hooks/use-translation"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import {
  CreateWorkMutation,
  LinkWorkToGenerationsMutation,
  WorkByImageHashQuery,
} from "~/routes/($lang)._main.new.image/utils/new-image-queries"
import { clearPersistedPostDrafts } from "~/routes/($lang)._main.new.image/utils/post-image-draft"
import {
  type EventOption,
  getPostEventPeriodError,
  toPostReservedAt,
} from "~/routes/($lang)._main.new.image/utils/post-form-event"
import {
  toImageWorkInput,
  toVideoWorkInput,
} from "~/routes/($lang)._main.new.image/utils/post-image-work-input"
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
  } = props

  const [createWork] = useMutation(CreateWorkMutation)
  const [linkWorkToGenerations] = useMutation(LinkWorkToGenerationsMutation)
  const [checkWorkByImageHash] = useLazyQuery(WorkByImageHashQuery, {
    // 前回のリトライで「なし」だった結果をキャッシュから返さない
    fetchPolicy: "network-only",
  })

  const uploadImages = async () => {
    if (userId === null) {
      return []
    }
    const images = state.items.map((item) => item.content)
    const uploads = images.map((image) => {
      if (image === null) {
        return null
      }
      return uploadPublicImage(image, token)
    })
    const imageUrls = await Promise.all(uploads)
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
          throw new Error(t("作品の投稿に失敗しました", "Failed to post the work"))
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

        dispatch({
          type: "MARK_AS_DONE",
          payload: {
            uploadedWorkId: work.data.createWork.id,
            uploadedWorkUuid: work.data.createWork.uuid,
          },
        })

        await clearPersistedPostDrafts()

        toast(t("作品を投稿しました", "Work has been posted"))
      } catch (error) {
        if (error instanceof Error) {
          toast(error.message)
        }

        await Promise.all(uploadedImageUrls.map((url) => deleteUploadedImage(url)))
        dispatch({ type: "SET_PROGRESS", payload: 0 })
      } finally {
        finishPosting()
      }

      return
    }

    dispatch({ type: "SET_PROGRESS", payload: 5 })

    const MAX_RETRIES = 3
    const uploadedImageUrls: string[] = []

    const failPost = async (error: unknown) => {
      if (error instanceof Error) {
        toast(error.message)
      }
      await Promise.all(uploadedImageUrls.map((url) => deleteUploadedImage(url)))
      dispatch({ type: "SET_PROGRESS", payload: 0 })
      finishPosting()
    }

    const completePost = async (
      uploadedWorkId: string,
      uploadedWorkUuid: string | null,
    ) => {
      dispatch({
        type: "MARK_AS_DONE",
        payload: { uploadedWorkId, uploadedWorkUuid },
      })

      await clearPersistedPostDrafts()

      toast(t("作品を投稿しました", "Work has been posted"))
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

      // 順に小サムネイル・大サムネイル・OGP（なければ空文字）・AI 評価用・本体の画像
      uploadedImageUrls.push(
        await uploadPublicImage(smallThumbnail.base64, token),
      )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      uploadedImageUrls.push(
        await uploadPublicImage(largeThumbnail.base64, token),
      )

      dispatch({ type: "SET_PROGRESS", payload: 50 })

      uploadedImageUrls.push(
        state.ogpBase64 ? await uploadPublicImage(state.ogpBase64, token) : "",
      )

      dispatch({ type: "SET_PROGRESS", payload: 60 })

      // AI評価用のJPEG画像をアップロード
      const botGradingImage = await resizeImage(
        formResult.output.thumbnailBase64,
        400,
        400,
        "jpeg",
      )

      uploadedImageUrls.push(
        await uploadPublicImage(botGradingImage.base64, token),
      )

      const uploadResults = await uploadImages()
      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        throw new Error(
          t("画像のアップロードに失敗しました", "Failed to upload the images"),
        )
      }

      uploadedImageUrls.push(...imageUrls)

      prepared = {
        reservedAt: toPostReservedAt(
          inputState.reservationDate,
          inputState.reservationTime,
        ),
        mainImageSha256: await sha256(formResult.output.thumbnailBase64),
        mainImageSize: await getSizeFromBase64(
          formResult.output.thumbnailBase64,
        ),
        smallThumbnail,
        largeThumbnail,
      }

      dispatch({ type: "SET_PROGRESS", payload: 70 })
    } catch (error) {
      await failPost(error)
      return
    }

    // 作品の作成だけをリトライする
    const performPost = async (retryCount = 0): Promise<void> => {
      try {
        console.log(
          `[投稿処理] リトライ回数: ${retryCount}, rating: ${inputState.ratingRestriction}`,
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
              inputState,
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
