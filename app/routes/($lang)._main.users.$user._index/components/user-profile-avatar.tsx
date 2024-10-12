import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"

type UserProfileAvatarProps = {
  alt: string
  src?: string
  size?: "sm" | "md" | "lg" | "auto"
}

export function UserProfileAvatar({
  alt,
  src,
  size = "md",
}: UserProfileAvatarProps) {
  const getSize = (size: "sm" | "md" | "lg" | "auto") => {
    switch (size) {
      case "sm":
        return "h-16 w-16"
      case "md":
        return "h-20 w-20"
      case "lg":
        return "h-32 w-32"
      case "auto":
        return "h-20 w-20 md:h-32 md:w-32"
      default:
        return "h-20 w-20"
    }
  }

  return (
    <Avatar className={cn(getSize(size), "border-2")}>
      <AvatarImage alt={alt} src={src} />
      <AvatarFallback />
    </Avatar>
  )
}
