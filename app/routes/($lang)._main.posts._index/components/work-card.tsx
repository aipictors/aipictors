type Props = {
  imageURL?: string
  imageWidth?: number
  imageHeight?: number
}

/**
 * 作品の画像
 */
export function WorkCard (props: Props) {
  if (!props.imageURL) {
    return null
  }

  return (
    <div className="aspect-square h-full w-full">
      <img
        className="h-full w-full rounded-lg object-cover"
        alt=""
        src={props.imageURL}
      />
    </div>
  )
}
