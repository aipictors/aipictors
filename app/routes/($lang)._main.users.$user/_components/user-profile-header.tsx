import { AspectRatio } from "@/_components/ui/aspect-ratio"

type Props = {
  headerImageUrl?: string
}

export const UserProfileHeader = (props: Props) => {
  return (
    <AspectRatio ratio={1500 / 500}>
      {props.headerImageUrl ? (
        <img
          alt=""
          src={props.headerImageUrl}
          className="w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-red-500">
          Header Not Found
        </div>
      )}
    </AspectRatio>
  )
}
