import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { config } from "@/config"
import { useSuspenseQuery } from "@tanstack/react-query"
import { memo } from "react"

type Props = {
  taskId: string
  className?: string
  alt: string
  token: string
  isThumbnail?: boolean
}

const Component = (props: Props) => {
  console.log(props.token)

  return (
    <img
      style={{ userSelect: "none" }}
      className={props.className}
      alt={props.alt}
      draggable={false}
      src={`https://www.aipictors.com/wp-content/themes/AISite/private-image-direct.php?token=${encodeURIComponent(
        props.token,
      )}`}
    />
  )
}

/**
 * プライベートな画像
 */
export const PrivateImage = memo(Component, (prev, next) => {
  return prev.taskId === next.taskId && prev.isThumbnail === next.isThumbnail
})
