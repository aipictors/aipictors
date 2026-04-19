import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"

type Props = {
  alt: string
  src?: string | null
  frame?: UserAvatarFramePresentation | null
  frameClassName?: string
  imageClassName?: string
  sizeClassName: string
}

export function UserAvatarWithFrame(props: Props) {
  const padding = Math.max(0, props.frame?.borderPadding ?? 4)

  if (props.frame === null || props.frame === undefined) {
    return (
      <Avatar className={props.sizeClassName}>
        <AvatarImage
          alt={props.alt}
          src={props.src ?? undefined}
          className={props.imageClassName}
        />
        <AvatarFallback />
      </Avatar>
    )
  }

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 rounded-full",
        props.sizeClassName,
        props.frameClassName,
      )}
      style={{
        background: props.frame.backgroundStyle ?? undefined,
        padding: `${padding}px`,
      }}
    >
      {props.frame.overlayImageUrl && (
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover"
          src={props.frame.overlayImageUrl}
        />
      )}
      <Avatar className="h-full w-full border border-background/70 bg-background">
        <AvatarImage
          alt={props.alt}
          src={props.src ?? undefined}
          className={props.imageClassName}
        />
        <AvatarFallback />
      </Avatar>
    </div>
  )
}