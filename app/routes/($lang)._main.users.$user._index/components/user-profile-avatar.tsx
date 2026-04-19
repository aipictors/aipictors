import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { cn } from "~/lib/utils"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"

type UserProfileAvatarProps = {
  alt: string
  frame?: UserAvatarFramePresentation | null
  src?: string
  size?: "sm" | "md" | "lg" | "auto"
}

export function UserProfileAvatar ({
  alt,
  frame,
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
    <UserAvatarWithFrame
      alt={alt}
      frame={frame}
      sizeClassName={cn(getSize(size), "border-2")}
      src={src}
    />
  )
}
