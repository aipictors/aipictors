import Image from "next/image"

type Props = {
  imageURL?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * 作品の画像
 */
export default function WorkCard(props: Props) {
  return (
    <Image
      className="w-full sm:h-auto md:h-64 xl:h-96 object-cover rounded-lg"
      alt=""
      src={props.imageURL}
      width={props.imageWidth}
      height={props.imageHeight}
    />
  )
}
