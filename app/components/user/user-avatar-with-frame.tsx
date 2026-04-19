import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { cn } from "~/lib/utils"
import type { UserAvatarFramePresentation } from "~/utils/user-avatar-frame"

type Props = {
  alt: string
  src?: string | null
  frame?: UserAvatarFramePresentation | null
  isAnimated?: boolean
  frameClassName?: string
  imageClassName?: string
  sizeClassName: string
}

export function UserAvatarWithFrame(props: Props) {
  const padding = Math.max(0, props.frame?.borderPadding ?? 3)
  const frameType = props.frame?.frameType ?? "GRADIENT"
  const isAnimated = props.isAnimated ?? true
  const shouldRenderBackgroundLayer =
    props.frame.backgroundStyle !== null && props.frame.backgroundStyle !== undefined
  const showGlossLayer =
    isAnimated &&
    (frameType === "ANIMATED_RAINBOW" ||
      frameType === "AURORA" ||
      frameType === "PEARL_SHINE" ||
      frameType === "STARLIGHT" ||
      frameType === "DECORATED" ||
      frameType === "GRADIENT")

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
        "avatar-frame relative inline-flex shrink-0 rounded-full",
        isAnimated && "avatar-frame-ambient",
        isAnimated &&
          frameType === "ANIMATED_RAINBOW" &&
          "avatar-frame-animated-rainbow",
        isAnimated && frameType === "AURORA" && "avatar-frame-aurora",
        isAnimated &&
          frameType === "PEARL_SHINE" &&
          "avatar-frame-pearl-shine",
        isAnimated && frameType === "STARLIGHT" && "avatar-frame-starlight",
        props.sizeClassName,
        props.frameClassName,
      )}
      style={{
        padding: `${padding}px`,
      }}
    >
      {shouldRenderBackgroundLayer && (
        <span
          aria-hidden
          className={cn(
            "avatar-frame-background",
            isAnimated &&
              frameType === "ANIMATED_RAINBOW" &&
              "avatar-frame-background-rainbow",
            isAnimated &&
              frameType === "AURORA" &&
              "avatar-frame-background-aurora",
            isAnimated &&
              frameType === "PEARL_SHINE" &&
              "avatar-frame-background-pearl",
            isAnimated &&
              frameType === "STARLIGHT" &&
              "avatar-frame-background-starlight",
          )}
          style={{
            background: props.frame.backgroundStyle ?? undefined,
          }}
        />
      )}
      {showGlossLayer && <span aria-hidden className="avatar-frame-gloss" />}
      {props.frame.overlayImageUrl && (
        <img
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full rounded-full object-cover"
          src={props.frame.overlayImageUrl}
        />
      )}
      <Avatar className="relative z-[2] h-full w-full border border-background/40 bg-background shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.32)]">
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