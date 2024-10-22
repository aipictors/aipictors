import FullScreenContainer from "~/components/full-screen-container"
import { cn } from "~/lib/utils"
import { getExtractInfoFromBase64 } from "~/utils/get-extract-info-from-png"
import { config } from "~/config"
import { ImageGenerationSelectorDialog } from "~/routes/($lang)._main.new.image/components/image-generation-selector-dialog"
import { PostFormItemThumbnailPositionAdjust } from "~/routes/($lang)._main.new.image/components/post-form-item-thumbnail-position-adjust"
import { PostFormItemOgp } from "~/routes/($lang)._main.new.image/components/post-form-item-ogp"
import type { Dispatch } from "react"
import { PostFormItemDraggableImages } from "~/routes/($lang)._main.new.image/components/post-form-item-draggable-images"
import type { PostTextFormAction } from "~/routes/($lang)._main.new.text/reducers/actions/post-text-form-action"
import type { PostTextFormState } from "~/routes/($lang)._main.new.text/reducers/states/post-text-form-state"
import { PaintCanvas } from "~/components/paint-canvas"

type Props = {
  dispatch: Dispatch<PostTextFormAction>
  state: PostTextFormState
}

export function EditTextFormUploader(props: Props) {
  const selectedFilesSizeText = () => {
    const totalBytes = props.state.items
      .map((item) => item.content)
      .reduce((acc, imageBase64) => {
        if (!imageBase64) {
          return acc
        }
        const byteLength = new TextEncoder().encode(imageBase64).length
        return acc + byteLength
      }, 0)

    if (totalBytes < 1024 * 1024) {
      return `${(totalBytes / 1024).toFixed(2)} KB`
    }
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const selectedImagesCountText = () => {
    const imageCount = props.state.items.filter((item) => item.content).length
    return `イラスト${imageCount}枚`
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
          <PostFormItemDraggableImages
            isOnlyMove={true}
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
        {props.state.thumbnailBase64 !== null &&
          props.state.ogpBase64 !== null && (
            <PostFormItemOgp
              imageBase64={props.state.thumbnailBase64}
              setOgpBase64={(base64) => {
                props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
              }}
              ogpBase64={props.state.ogpBase64}
            />
          )}
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
          />
        </FullScreenContainer>
      )}
    </div>
  )
}
