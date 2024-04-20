import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar"

type UserProfileAvatarProps = {
  alt: string
  src?: string
}

export const UserProfileAvatar = ({ alt, src }: UserProfileAvatarProps) => {
  return (
    <Avatar className="h-20 w-20 border-2">
      <AvatarImage alt={alt} src={src} />
      <AvatarFallback />
    </Avatar>
  )
}
