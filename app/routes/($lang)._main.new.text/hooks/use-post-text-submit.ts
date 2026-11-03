import { useMutation } from "@apollo/client/index"
import type { Dispatch } from "react"
import { toast } from "sonner"
import type { SafeParseResult } from "valibot"
import type { TranslationFn } from "~/hooks/use-translation"
import {
  type EventOption,
  getPostEventPeriodError,
  toPostReservedAt,
} from "~/routes/($lang)._main.new.image/utils/post-form-event"
import type { vPostTextForm } from "~/routes/($lang)._main.new.image/validations/post-text-form"
import type { PostTextFormAction } from "~/routes/($lang)._main.new.text/reducers/actions/post-text-form-action"
import type { PostTextFormInputState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-input-state"
import type { PostTextFormState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-state"
import { CreateWorkMutation } from "~/routes/($lang)._main.new.text/utils/new-text-queries"
import { toTextWorkInput } from "~/routes/($lang)._main.new.text/utils/post-text-work-input"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeThumbnail } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"
import { uploadTextFile } from "~/utils/upload-text-file"

type Props = {
  state: PostTextFormState
  inputState: PostTextFormInputState
  dispatch: Dispatch<PostTextFormAction>
  events: EventOption[]
  formResult: SafeParseResult<typeof vPostTextForm>
  token: string | null | undefined
  userId: string | null
  t: TranslationFn
}

/**
 * 小説・コラムの投稿
 */
export function usePostTextSubmit(props: Props) {
  const { state, inputState, dispatch, events, formResult, token, userId, t } =
    props

  const [createWork] = useMutation(CreateWorkMutation)

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

  const onPost = async () => {
    const url = uploadTextFile(
      inputState.md,
      "md",
      token,
      "https://text-files.aipictors.com/c09d45d7-c949-4515-b477-d1c17f1dd038",
    )

    if (url === null) {
      toast(t("本文のアップロードに失敗しました", "Failed to upload the text"))
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
          "Please enter the scheduled post time",
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
          "Please enter the scheduled post time",
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

    const uploadedImageUrls = []

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

      const smallThumbnailUrl = await uploadPublicImage(
        smallThumbnail.base64,
        token,
      )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

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

      const textFile = await uploadTextFile(
        inputState.md,
        "md",
        token,
      )

      if (textFile === null) {
        toast(
          t("本文のアップロードに失敗しました", "Failed to upload the text"),
        )
        return
      }

      const uploadResults = await uploadImages()

      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        toast(t("画像のアップロードに失敗しました", "Failed to upload images"))
        return
      }

      const work = await createWork({
        variables: {
          input: toTextWorkInput({
            form: formResult.output,
            inputState,
            state,
            reservedAt,
            mainImageSha256,
            mainImageSize,
            imageUrls,
            smallThumbnail,
            smallThumbnailUrl,
            largeThumbnail,
            largeThumbnailUrl,
            ogpBase64Url,
            mdUrl: textFile,
          }),
        },
      })

      if (work.data?.createWork === undefined) {
        toast(t("作品の投稿に失敗しました", "Failed to post the work"))
        return
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

  return onPost
}
