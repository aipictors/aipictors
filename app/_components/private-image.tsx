import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { config } from "@/config"
import { useSuspenseQuery } from "@tanstack/react-query"
import { memo } from "react"

type Props = {
  taskId: string
  className?: string
  alt: string
  token: string
}

const Component = (props: Props) => {
  const { data } = useSuspenseQuery({
    queryKey: [props.taskId],
    queryFn() {
      return fetchImage(config.wordpressEndpoint.privateImage, props.token)
    },
  })

  return (
    <img
      className={props.className}
      alt={props.alt}
      draggable={false}
      src={data}
    />
  )
}

/**
 * プライベートな画像
 */
export const PrivateImage = memo(Component, (prev, next) => {
  return prev.taskId === next.taskId
})
