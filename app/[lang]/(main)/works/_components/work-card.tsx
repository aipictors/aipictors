type Props = {
  imageURL?: string
}

export const WorkCard = (props: Props) => {
  return (
    <img
      className="w-full h-full object-cover rounded-md"
      alt=""
      src={props.imageURL}
    />
  )
}
