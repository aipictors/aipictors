import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
    <>
      {props.imageURL ? (
        <Image
          className="w-full sm:h-auto md:h-64 xl:h-96 object-cover rounded-lg"
          alt=""
          src={props.imageURL}
          width={props.imageWidth}
          height={props.imageHeight}
        />
      ) : (
        <div className="w-full sm:h-auto md:h-64 xl:h-96 object-cover rounded-lg">
          Image Not Found
        </div>
      )}
    </>
  )
}
