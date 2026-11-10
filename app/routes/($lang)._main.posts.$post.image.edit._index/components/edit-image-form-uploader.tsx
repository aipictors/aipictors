import type { Dispatch } from "react"
import { toast } from "sonner"
import FullScreenContainer from "~/components/full-screen-container"
import { PaintCanvas } from "~/components/paint-canvas"
import { Button } from "~/components/ui/button"
import { config } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { ImageGenerationSelectorDialog } from "~/routes/($lang)._main.new.image/components/image-generation-selector-dialog"
import { PostFormItemDraggableImages } from "~/routes/($lang)._main.new.image/components/post-form-item-draggable-images"
import { PostFormItemOgp } from "~/routes/($lang)._main.new.image/components/post-form-item-ogp"
import { PostFormItemThumbnailPositionAdjust } from "~/routes/($lang)._main.new.image/components/post-form-item-thumbnail-position-adjust"
import type { PostImageFormAction } from "~/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormState } from "~/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import {
  getExtractInfoFromBase64,
  getExtractInfoFromPNG,
} from "~/utils/get-extract-info-from-png"
import { getImageItemsSizeText } from "~/utils/image-items-size-text"

type Props = {
  dispatch: Dispatch<PostImageFormAction>
  state: PostImageFormState
}

export function EditImageFormUploader(props: Props) {
  const t = useTranslation()

  const selectedFilesSizeText = () =>
    getImageItemsSizeText(props.state.items.map((item) => item.content))

  const selectedImagesCountText = () => {
    const imageCount = props.state.items.filter((item) => item.content).length
    return `${t("イラスト", "Images")}${imageCount}${t("枚", " items")}`
  }

  const onInputPngInfo = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/png"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        return
      }
      const pngInfo = await getExtractInfoFromPNG(file)
      if (pngInfo.src !== null) {
        props.dispatch({
          type: "SET_PNG_INFO",
          payload: pngInfo,
        })
        toast(
          t(
            "PNG情報の取得と反映処理をいたしました、画像の種類によっては取得できていない場合があります",
            "PNG information has been retrieved",
          ),
        )
        return
      }
      props.dispatch({ type: "SET_PNG_INFO", payload: null })
      toast(
        t(
          "PNG情報を取得できませんでした",
          "Failed to retrieve PNG information",
        ),
      )
    }
    input.click()
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md">
        <div
          className={cn(
            "relative items-center rounded-b bg-zinc-800",
            props.state.isHovered && "border-2 border-white border-dashed",
          )}
        >
          {props.state.items.length !== 0 && (
            <div className="mb-4 bg-zinc-600 p-1 pl-4 dark:bg-blend-darken">
              <div className="flex space-x-4 text-white">
                <div className="flex">{selectedImagesCountText()}</div>
                <div className="flex">{selectedFilesSizeText()}</div>
              </div>
            </div>
          )}
          {/* 編集でも画像を 1 枚ずつ外したり、追加・差し替え・並べ替えたりできる
              （以前は並べ替えだけで、1 枚だけ問題があるときに作品ごと消すしかなかった） */}
          <PostFormItemDraggableImages
            isOnlyMove={false}
            indexList={props.state.indexList}
            items={props.state.items ?? []}
            setItems={(items) => {
              props.dispatch({ type: "SET_ITEMS", payload: items })
            }}
            onChangeItems={(items) => {
              props.dispatch({ type: "SET_ITEMS", payload: items })
            }}
            maxItemsCount={config.post.maxImageCount}
            setIndexList={(value) => {
              props.dispatch({ type: "SET_INDEX_LIST", payload: value })
            }}
            onChangePngInfo={(value) => {
              props.dispatch({ type: "SET_PNG_INFO", payload: value })
            }}
            onMosaicButtonClick={(value) => {
              props.dispatch({
                type: "SET_EDIT_TARGET_IMAGE_BASE64",
                payload: value,
              })
            }}
            setThumbnailBase64={(base64) => {
              props.dispatch({ type: "SET_THUMBNAIL_BASE64", payload: base64 })
            }}
            setOgpBase64={(base64) => {
              props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
            }}
            setIsThumbnailLandscape={(value) => {
              props.dispatch({
                type: "SET_IS_THUMBNAIL_LANDSCAPE",
                payload: value,
              })
            }}
          />
        </div>
        {props.state.thumbnailBase64 !== null && (
          <PostFormItemThumbnailPositionAdjust
            isThumbnailLandscape={props.state.isThumbnailLandscape}
            thumbnailBase64={props.state.thumbnailBase64}
            thumbnailPosX={props.state.thumbnailPosX}
            thumbnailPosY={props.state.thumbnailPosY}
            setThumbnailPosX={(posX) => {
              props.dispatch({
                type: "SET_THUMBNAIL_POS_X",
                payload: posX,
              })
            }}
            setThumbnailPosY={(posY) => {
              props.dispatch({
                type: "SET_THUMBNAIL_POS_Y",
                payload: posY,
              })
            }}
          />
        )}
        {props.state.thumbnailBase64 !== null && (
          <PostFormItemOgp
            imageBase64={props.state.thumbnailBase64}
            setOgpBase64={(base64) => {
              props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
            }}
            ogpBase64={props.state.ogpBase64 ?? ""}
          />
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant={"secondary"}
          onClick={onInputPngInfo}
          className="block"
        >
          {t("画像から生成情報のみ反映", "Apply Information Only from Image")}
        </Button>
      </div>

      <ImageGenerationSelectorDialog
        isOpen={props.state.isOpenImageGenerationDialog}
        setIsOpen={() => {
          props.dispatch({ type: "CLOSE_IMAGE_GENERATION_DIALOG" })
        }}
        onSubmit={async (
          selectedImage: string[],
          selectedIds: string[],
          lastSelectedOriginalImage: string,
        ) => {
          props.dispatch({
            type: "SUBMIT_IMAGE_GENERATION_DIALOG",
            payload: {
              selectedImageGenerationUrls: selectedImage,
              selectedImageGenerationIds: selectedIds,
            },
          })
          if (selectedImage.length === 0) {
            props.dispatch({
              type: "IS_SELECTED_GENERATION_IMAGE",
              payload: false,
            })
            return
          }
          props.dispatch({
            type: "IS_SELECTED_GENERATION_IMAGE",
            payload: true,
          })

          const pngInfo = await getExtractInfoFromBase64(
            lastSelectedOriginalImage,
          )
          if (pngInfo.src !== null) {
            props.dispatch({
              type: "SET_PNG_INFO",
              payload: pngInfo,
            })
            return
          }
        }}
      />
      {props.state.editTargetImageBase64 !== null && (
        <FullScreenContainer
          onClose={() => {
            props.dispatch({
              type: "SET_EDIT_TARGET_IMAGE_BASE64",
              payload: null,
            })
          }}
          enabledScroll={props.state.isDrawing}
        >
          <PaintCanvas
            onChangeSetDrawing={(isDrawing: boolean) =>
              props.dispatch({ type: "SET_IS_DRAWING", payload: isDrawing })
            }
            imageUrl={props.state.editTargetImageBase64}
            isMosaicMode={true}
            isShowSubmitButton={true}
            onSubmit={(base64: string) => {
              props.dispatch({
                type: "SET_EDITED_IMAGE",
                payload: { base64 },
              })
            }}
            onClose={() => {
              props.dispatch({
                type: "SET_EDIT_TARGET_IMAGE_BASE64",
                payload: null,
              })
            }}
          />
        </FullScreenContainer>
      )}
    </div>
  )
}
