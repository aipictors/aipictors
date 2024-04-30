import { config } from "@/config"
import { memo } from "react"

type Props = {
  taskId: string
  className?: string
  alt: string
  token: string
  isThumbnail?: boolean
  thumbnailFileName: string
  fileName: string
}

const Component = (props: Props) => {
  const imageUrl = props.isThumbnail ? props.thumbnailFileName : props.fileName

  return (
    <img
      style={{ userSelect: "none" }}
      className={props.className}
      alt={props.alt}
      draggable={false}
      src={`${config.wordpressEndpoint.privateImage}?token=${encodeURIComponent(
        props.token,
      )}&name=${imageUrl}`}
      data-original={`${
        config.wordpressEndpoint.privateImage
      }?token=${encodeURIComponent(props.token || "")}&name=${props.fileName}`}
    />
  )
}

/**
 * プライベートな画像
 */
export const PrivateImage = memo(Component, (prev, next) => {
  return prev.taskId === next.taskId && prev.isThumbnail === next.isThumbnail
})
