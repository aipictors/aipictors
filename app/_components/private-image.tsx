import { fetchImage } from "@/app/_utils/fetch-image-object-url"
import { Config } from "@/config"
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
      return fetchImage(Config.wordpressPrivateImageEndpoint, props.token)
    },
  })

  // const objectURL = use(
  //   fetchImage(Config.wordpressPrivateImageEndpoint, props.token),
  // )

  return (
    <img
      className={props.className}
      alt={props.alt}
      draggable={false}
      src={data}
    />
  )
}

export const PrivateImage = memo(Component, (prev, next) => {
  return prev.taskId === next.taskId
})
