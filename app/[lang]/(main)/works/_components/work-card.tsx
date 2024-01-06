import Image from "next/image"

type Props = {
  imageURL?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * 作品の画像
 */
export const WorkCard = (props: Props) => {
  return (
    <div className="relative">
      {props.imageURL ? (
        <Image
          className="w-full h-auto object-cover rounded"
          alt=""
          src={props.imageURL}
          width={props.imageWidth}
          height={props.imageHeight}
        />
      ) : (
        <div className="w-full h-auto object-cover rounded">
          Image Not Found
        </div>
      )}
    </div>
  )
}