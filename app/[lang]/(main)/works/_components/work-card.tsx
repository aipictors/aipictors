type Props = {
  imageURL?: string
}

export const WorkCard = (props: Props) => {
  return (
    <img
      className="w-full h-full object-cover rounded"
      alt=""
      src={props.imageURL}
    />
  )
}
