import Image from "next/image"

type Props = {
  imageURL?: string
  imageWith?: number
  imageHeight?: number
}

/**
 * 作品の画像
 */
export const WorkCard = (props: Props) => {
  return (
    <Image
      className="w-full h-auto object-cover rounded"
      alt=""
      src={props.imageURL}
      width={props.imageWith}
      height={props.imageHeight}
    />
  )
}
