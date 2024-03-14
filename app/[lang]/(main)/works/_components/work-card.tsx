import Image from "next/image"
import { notFound } from "next/navigation"

type Props = {
  imageURL?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * 作品の画像
 */
export default function WorkCard(props: Props) {
  if (!props.imageURL) {
    notFound()
  }

  return (
    <Image
      className="w-full rounded-lg object-cover md:h-64 sm:h-auto xl:h-96"
      alt=""
      src={props.imageURL}
      width={props.imageWidth}
      height={props.imageHeight}
    />
  )
}
