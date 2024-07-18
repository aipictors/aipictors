import { cn } from "@/_lib/cn"
import { PostFormItemThumbnailPositionAdjust } from "@/routes/($lang)._main.new.image/_components/post-form-item-thumbnail-position-adjust"
import { PostFormItemOgp } from "@/routes/($lang)._main.new.image/_components/post-form-item-ogp"
import type { Dispatch } from "react"
import type { PostAnimationFormAction } from "@/routes/($lang)._main.new.animation/reducers/actions/post-animation-form-action"
import type { PostAnimationFormState } from "@/routes/($lang)._main.new.animation/reducers/states/post-animation-form-state"
import { PostFormItemVideo } from "@/routes/($lang)._main.new.image/_components/post-form-item-video"

type Props = {
  dispatch: Dispatch<PostAnimationFormAction>
  state: PostAnimationFormState
}

export function PostAnimationFormUploader(props: Props) {
  return (
    <div className="space-y-2">
      <div className="rounded-md">
        <div
          className={cn(
            "relative items-center bg-zinc-800",
            props.state.isHovered && "border-2 border-white border-dashed",
          )}
        >
          <PostFormItemVideo
            videoFile={
              props.state.videoFile ? (props.state.videoFile as File) : null
            }
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
            onVideoChange={(videoFile) => {
              props.dispatch({ type: "SET_ANIMATION_FILE", payload: videoFile })
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
    </div>
  )
}
