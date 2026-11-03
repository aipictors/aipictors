import { useMutation } from "@apollo/client/index"
import type { Dispatch } from "react"
import { toast } from "sonner"
import type { SafeParseResult } from "valibot"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormInputState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-input-state"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import { toPostReservedAt } from "~/routes/($lang)._main.new.image/utils/post-form-event"
import type { vPostImageForm } from "~/routes/($lang)._main.new.image/validations/post-image-form"
import type { EditImageWork } from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-form-state"
import { updateWorkMutation } from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-queries"
import { toUpdateWorkInput } from "~/routes/($lang)._main.posts.$post.image.edit._index/utils/edit-image-work-input"
import { deleteUploadedImage } from "~/utils/delete-uploaded-image"
import { getSizeFromBase64 } from "~/utils/get-size-from-base64"
import { resizeThumbnail } from "~/utils/resize-image"
import { sha256 } from "~/utils/sha256"
import { uploadPublicImage } from "~/utils/upload-public-image"

type Props = {
  work: EditImageWork | null
  state: PostImageFormState
  inputState: PostImageFormInputState
  dispatch: Dispatch<PostImageFormAction>
  formResult: SafeParseResult<typeof vPostImageForm>
  token: string | null | undefined
  userId: string | null
}

/**
 * 作品の更新
 */
export function useEditImageSubmit(props: Props) {
  const { work, state, inputState, dispatch, formResult, token, userId } = props

  const [updateWork] = useMutation(updateWorkMutation)

  /** 編集前の画像（修正完了の報告に、何枚消した・足したかを書くため） */
  const originalImageUrls = [
    work?.imageURL ?? "",
    ...(work?.subWorks ?? []).map((subWork) => subWork.imageUrl ?? ""),
  ].filter((url) => url !== "")

  const uploadImages = async () => {
    if (userId === null) {
      return []
    }

    const images = state.items.map((item) => item.content)

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        if (!image) {
          return null
        }
        const imageUrl = image.startsWith("https://")
          ? image
          : await uploadPublicImage(image, token)
        return imageUrl
      }),
    )

    return imageUrls
  }

  const onPost = async () => {
    console.log("=== onPost function started ===")
    console.log("Current inputState at onPost start:", {
      isBotGradingPublic: inputState.isBotGradingPublic,
      isBotGradingRankingEnabled: inputState.isBotGradingRankingEnabled,
      isBotGradingEnabled: inputState.isBotGradingEnabled,
      title: inputState.title,
      accessType: inputState.accessType,
    })

    if (work === null) {
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
      toast("予約投稿の時間を入力してください")
      return
    }

    if (
      inputState.reservationDate === null &&
      inputState.reservationTime !== null
    ) {
      toast("予約投稿の時間を入力してください")
      return
    }

    if (inputState.ratingRestriction === null) {
      toast("年齢種別を選択してください")
      return
    }

    const uploadedImageUrls = []

    try {
      dispatch({ type: "SET_PROGRESS", payload: 10 })

      const smallThumbnail = formResult.output.thumbnailBase64.startsWith(
        "https://",
      )
        ? null
        : await resizeThumbnail(
            formResult.output.thumbnailBase64,
            400,
            1200,
            "webp",
          )

      dispatch({ type: "SET_PROGRESS", payload: 20 })

      const largeThumbnail = formResult.output.thumbnailBase64.startsWith(
        "https://",
      )
        ? null
        : await resizeThumbnail(
            formResult.output.thumbnailBase64,
            600,
            1600,
            "webp",
          )

      dispatch({ type: "SET_PROGRESS", payload: 30 })

      const smallThumbnailUrl =
        formResult.output.thumbnailBase64.startsWith("https://") ||
        smallThumbnail === null
          ? (work.smallThumbnailImageURL ?? "")
          : await uploadPublicImage(
              smallThumbnail.base64,
              token,
            )

      dispatch({ type: "SET_PROGRESS", payload: 40 })

      uploadedImageUrls.push(smallThumbnailUrl)

      const largeThumbnailUrl =
        formResult.output.thumbnailBase64.startsWith("https://") ||
        largeThumbnail === null
          ? (work.largeThumbnailImageURL ?? "")
          : await uploadPublicImage(
              largeThumbnail.base64,
              token,
            )

      uploadedImageUrls.push(largeThumbnailUrl)

      dispatch({ type: "SET_PROGRESS", payload: 50 })

      uploadedImageUrls.push(largeThumbnailUrl)

      const ogpBase64Url =
        state.ogpBase64 === null ||
        state.ogpBase64 === "" ||
        state.ogpBase64?.startsWith("https://")
          ? work.ogpThumbnailImageUrl
          : await uploadPublicImage(
              state.ogpBase64 ?? "",
              token,
            )

      dispatch({ type: "SET_PROGRESS", payload: 60 })

      if (ogpBase64Url !== null && ogpBase64Url !== "") {
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

      const uploadResults = await uploadImages()

      const imageUrls = uploadResults.filter((url) => url !== null)

      if (imageUrls.length === 0) {
        toast("画像の取得に失敗しました")
        return
      }

      // AI評価設定の値をデバッグログで確認
      console.log("=== updateWork AI評価設定 ===")
      console.log(
        "inputState.isBotGradingPublic:",
        inputState.isBotGradingPublic,
      )
      console.log(
        "inputState.isBotGradingRankingEnabled:",
        inputState.isBotGradingRankingEnabled,
      )
      console.log(
        "inputState.isBotGradingEnabled:",
        inputState.isBotGradingEnabled,
      )

      // updateWork mutation用の入力データを準備
      const updateWorkInput = toUpdateWorkInput({
        work,
        form: formResult.output,
        inputState,
        state,
        rating: inputState.ratingRestriction,
        reservedAt,
        mainImageSha256,
        mainImageSize,
        imageUrls,
        originalImageUrls,
        smallThumbnail,
        smallThumbnailUrl,
        largeThumbnail,
        largeThumbnailUrl,
        ogpBase64Url,
      })

      // mutation実行前に全データをログ出力
      console.log("=== updateWork 完全なinput ===")
      console.log("Full input object:", updateWorkInput)
      console.log("AI評価設定のみ抽出:")
      console.log("- isBotGradingPublic:", updateWorkInput.isBotGradingPublic)
      console.log(
        "- isBotGradingRankingEnabled:",
        updateWorkInput.isBotGradingRankingEnabled,
      )

      const updatedWork = await updateWork({
        variables: {
          input: updateWorkInput,
        },
      })

      // mutation実行後の結果をログ出力
      console.log("=== updateWork 実行結果 ===")
      console.log("updatedWork result:", updatedWork)
      console.log("updatedWork.data:", updatedWork.data)
      console.log("updatedWork.data?.updateWork:", updatedWork.data?.updateWork)
      if (updatedWork.data?.updateWork) {
        console.log("更新後のAI評価設定:")
        console.log(
          "- isBotGradingPublic:",
          updatedWork.data.updateWork.isBotGradingPublic,
        )
        console.log(
          "- isBotGradingRankingEnabled:",
          updatedWork.data.updateWork.isBotGradingRankingEnabled,
        )
      }
      if (updatedWork.errors) {
        console.log("GraphQL errors:", updatedWork.errors)
      }

      if (updatedWork?.data?.updateWork === undefined) {
        toast("作品の更新に失敗しました")
        return
      }

      dispatch({
        type: "MARK_AS_DONE",
        payload: {
          uploadedWorkId: updatedWork?.data?.updateWork.id,
          uploadedWorkUuid: updatedWork?.data?.updateWork.uuid,
        },
      })

      toast("作品を投稿しました")
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
