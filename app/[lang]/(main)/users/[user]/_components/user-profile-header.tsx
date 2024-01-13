import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"

type Props = {
  headerImageUrl?: string
}

export const UserProfileHeader = (props: Props) => {
  return (
    <AspectRatio ratio={1500 / 500}>
      {props.headerImageUrl ? (
        <Image
          alt=""
          src={props.headerImageUrl}
          fill
          className="w-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-red-500">
          Header Not Found
        </div>
      )}
    </AspectRatio>
  )
}
