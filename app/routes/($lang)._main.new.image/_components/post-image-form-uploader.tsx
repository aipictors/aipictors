import FullScreenContainer from "@/_components/full-screen-container"
import PaintCanvas from "@/_components/paint-canvas"
import { Button } from "@/_components/ui/button"
import { cn } from "@/_lib/cn"
import { getExtractInfoFromPNG } from "@/_utils/get-extract-info-from-png"
import { config } from "@/config"
import { ImageGenerationSelectorDialog } from "@/routes/($lang)._main.new.image/_components/image-generation-selector-dialog"
import { PostFormItemDraggableImagesAndVideo } from "@/routes/($lang)._main.new.image/_components/post-form-item-draggable-images-and-video"
import { PostFormItemThumbnailPositionAdjust } from "@/routes/($lang)._main.new.image/_components/post-form-item-thumbnail-position-adjust"
import { PostFormOgp } from "@/routes/($lang)._main.new.image/_components/post-form-ogp"
import type { PostImageFormAction } from "@/routes/($lang)._main.new.image/reducers/actions/post-image-form-action"
import type { PostImageFormState } from "@/routes/($lang)._main.new.image/reducers/states/post-image-form-state"
import type { Dispatch } from "react"
import { toast } from "sonner"

type Props = {
  dispatch: Dispatch<PostImageFormAction>
  state: PostImageFormState
}

export function PostImageFormUploader(props: Props) {
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
        toast("PNG情報を取得しました")
        return
      }
      props.dispatch({ type: "SET_PNG_INFO", payload: null })
      toast("PNG情報を取得できませんでした")
    }
    input.click()
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md">
        <div
          className={cn(
            "relative items-center bg-zinc-800",
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
          <PostFormItemDraggableImagesAndVideo
            indexList={props.state.indexList}
            items={props.state.items ?? []}
            videoFile={props.state.videoFile as File}
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
            onVideoChange={(value) => {
              // props.dispatch({ type: "SET_VIDEO_FILE", payload: value })
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
            <PostFormOgp
              imageBase64={props.state.thumbnailBase64}
              setOgpBase64={(base64) => {
                props.dispatch({ type: "SET_OGP_BASE64", payload: base64 })
              }}
              ogpBase64={props.state.ogpBase64}
            />
          )}
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant={"secondary"}
          onClick={onInputPngInfo}
          className="block"
        >
          {"PNG情報のみ読み込み"}
        </Button>
        <Button
          variant={"secondary"}
          className="block"
          onClick={() => {
            props.dispatch({
              type: "SET_IS_OPEN_IMAGE_GENERATION_DIALOG",
              payload: true,
            })
          }}
        >
          {"生成画像"}
        </Button>
      </div>
      <ImageGenerationSelectorDialog
        isOpen={props.state.isOpenImageGenerationDialog}
        setIsOpen={() => {
          props.dispatch({ type: "CLOSE_IMAGE_GENERATION_DIALOG" })
        }}
        onSubmit={(imageIds) => {
          for (const imageId of imageIds) {
            props.dispatch({ type: "ADD_IMAGE", payload: { imageId } })
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
            onChangeSetDrawing={(isDrawing) =>
              props.dispatch({ type: "SET_IS_DRAWING", payload: isDrawing })
            }
            imageUrl={props.state.editTargetImageBase64}
            isMosaicMode={true}
            isShowSubmitButton={true}
            onSubmit={(base64) => {
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
