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
  const frameAnimationClassName =
    isAnimated && frameType === "ANIMATED_RAINBOW"
      ? "avatar-frame-background-rainbow"
      : isAnimated && frameType === "AURORA"
        ? "avatar-frame-background-aurora"
        : isAnimated && frameType === "PEARL_SHINE"
          ? "avatar-frame-background-pearl"
          : isAnimated && frameType === "STARLIGHT"
            ? "avatar-frame-background-starlight"
            : undefined
  const shouldRenderBackgroundLayer =
    props.frame?.backgroundStyle !== null &&
    props.frame?.backgroundStyle !== undefined
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
      <PlainAvatar
        className={props.sizeClassName}
        src={props.src}
        alt={props.alt}
        imageClassName={props.imageClassName}
      />
    )
  }

  return (
    <div
      className={cn(
        "avatar-frame relative inline-flex shrink-0 rounded-full",
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
          className={cn("avatar-frame-background", frameAnimationClassName)}
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
      <PlainAvatar
        className="relative z-[2] h-full w-full border border-background/40 bg-background shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.32)]"
        src={props.src}
        alt={props.alt}
        imageClassName={props.imageClassName}
      />
    </div>
  )
}

/**
 * アイコン画像（ふつうの img）
 * 一覧で数十個並ぶので、Radix の Avatar（画像ごとに読み込み確認の処理が走り、サーバーの HTML には画像が出ない）は使わない
 */
function PlainAvatar(props: {
  className?: string
  src?: string | null
  alt?: string
  imageClassName?: string
}) {
  return (
    <span
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full bg-muted",
        props.className,
      )}
    >
      {props.src && (
        <img
          src={props.src}
          alt={props.alt ?? ""}
          className={cn(
            "aspect-square h-full w-full object-cover",
            props.imageClassName,
          )}
          loading="lazy"
          decoding="async"
          // アイコンは小さく表示するだけなので後回しにする（画面内にあると優先度が上がり、
          // 元画像が 70KB 近いものもあって、作品の画像と回線を取り合っていた）
          fetchPriority="low"
        />
      )}
    </span>
  )
}
