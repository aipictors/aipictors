import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"

type UserProfileAvatarProps = {
  alt: string
  src?: string
  size?: "sm" | "md" | "lg" | "auto"
}

export function UserProfileAvatar ({
  alt,
  src,
  size = "md",
}: UserProfileAvatarProps) {
  const getSize = (size: "sm" | "md" | "lg" | "auto") => {
    switch (size) {
      case "sm":
        return "size-16"
      case "md":
        return "size-20"
      case "lg":
        return "size-32"
      case "auto":
        return "size-20 md:h-32 md:w-32"
      default:
        return "size-20"
    }
  }

  return (
    <Avatar className={cn(getSize(size), "border-2")}>
      <AvatarImage alt={alt} src={src} />
      <AvatarFallback />
    </Avatar>
  )
}
