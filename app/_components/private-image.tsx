import { memo } from "react"

type Props = {
  taskId: string
  className?: string
  alt: string
  token: string
  isThumbnail?: boolean
  originalToken?: string
}

const Component = (props: Props) => {
  return (
    <img
      style={{ userSelect: "none" }}
      className={props.className}
      alt={props.alt}
      draggable={false}
      src={`https://www.aipictors.com/wp-content/themes/AISite/private-image-direct.php?token=${encodeURIComponent(
        props.token,
      )}`}
      data-original={`https://www.aipictors.com/wp-content/themes/AISite/private-image-direct.php?token=${encodeURIComponent(
        props.originalToken || "",
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
