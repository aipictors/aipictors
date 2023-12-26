import Image from "next/image"

type Props = {
  imageURL?: string
}

export const WorkCard = (props: Props) => {
  return (
    <Image
      className="w-full h-full object-cover rounded-lg"
      alt=""
      src={props.imageURL}
      fill
    />
  )
}
