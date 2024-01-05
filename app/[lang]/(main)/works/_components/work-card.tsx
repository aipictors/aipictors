type Props = {
  imageURL?: string
}

/**
 * 作品の画像
 */
export const WorkCard = (props: Props) => {
  return (
    <img
      className="w-full h-full object-cover rounded"
      alt=""
      src={props.imageURL}
    />
  )
}
