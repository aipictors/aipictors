type Props = {
  alt: string
  imageURL: string
}

export const EventImage = (props: Props) => {
  return (
    <div className="relative">
      <img
        alt={props.alt}
        src={props.imageURL}
        className="w-full object-cover object-top rounded-t-md rounded-bl-md rounded-br-3xl"
      />
    </div>
  )
}
