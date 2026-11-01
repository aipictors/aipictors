import { Check, Lock } from "lucide-react"
import { useMemo, useState } from "react"
import { UserAvatarWithFrame } from "~/components/user/user-avatar-with-frame"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import {
  canUseUserAvatarFrame,
  toUserAvatarFrameCategory,
  toUserAvatarFramePassLabel,
  USER_AVATAR_FRAME_CATEGORIES,
  type UserAvatarFrameCategory,
  type UserAvatarFramePassType,
  type UserAvatarFramePresentation,
} from "~/utils/user-avatar-frame"

type Frame = UserAvatarFramePresentation & {
  id: string
  slug: string
  name: string
  description?: string | null
  requiredPassType: string
}

type Props = {
  frames: Frame[]
  selectedFrameId: string | null
  profileImageSrc?: string | null
  currentPassType: UserAvatarFramePassType
  onSelect: (frameId: string | null) => void
}

/**
 * アイコン枠を選ぶ（分類で絞って、自分のアイコンで見比べる）
 */
export function AvatarFramePicker(props: Props) {
  const t = useTranslation()
  const [category, setCategory] = useState<UserAvatarFrameCategory>("all")
  const [hoveredFrameId, setHoveredFrameId] = useState<string | null>(null)

  const counts = useMemo(() => {
    const result = new Map<string, number>()
    for (const frame of props.frames) {
      const key = toUserAvatarFrameCategory(frame.slug)
      result.set(key, (result.get(key) ?? 0) + 1)
    }
    return result
  }, [props.frames])

  const categories = USER_AVATAR_FRAME_CATEGORIES.filter(
    (item) => item.key === "all" || (counts.get(item.key) ?? 0) > 0,
  )
  const visibleFrames =
    category === "all"
      ? props.frames
      : props.frames.filter(
          (frame) => toUserAvatarFrameCategory(frame.slug) === category,
        )
  const selectedFrame = props.frames.find(
    (frame) => frame.id === props.selectedFrameId,
  )

  return (
    <div className="space-y-3">
      <div
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
        role="group"
        aria-label={t("枠の分類", "Frame categories")}
      >
        {categories.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={category === item.key}
            onClick={() => setCategory(item.key)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3.5 text-sm transition-colors",
              category === item.key
                ? "bg-foreground font-medium text-background"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {t(item.ja, item.en)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {category === "all" && (
          <FrameTile
            isAllowed={true}
            isSelected={props.selectedFrameId === null}
            label={t("枠なし", "No frame")}
            onSelect={() => props.onSelect(null)}
          >
            <UserAvatarWithFrame
              alt=""
              sizeClassName="size-14"
              src={props.profileImageSrc}
            />
          </FrameTile>
        )}
        {visibleFrames.map((frame) => {
          const isAllowed = canUseUserAvatarFrame(
            props.currentPassType,
            frame.requiredPassType as UserAvatarFramePassType,
          )
          const isSelected = props.selectedFrameId === frame.id

          return (
            <FrameTile
              key={frame.id}
              isAllowed={isAllowed}
              isSelected={isSelected}
              label={frame.name}
              lockLabel={`${toUserAvatarFramePassLabel(frame.requiredPassType as UserAvatarFramePassType)}+`}
              onHoverChange={(isHovered) =>
                setHoveredFrameId(isHovered ? frame.id : null)
              }
              onSelect={() => props.onSelect(frame.id)}
            >
              <UserAvatarWithFrame
                alt=""
                frame={frame}
                isDecorationAnimated={isSelected || hoveredFrameId === frame.id}
                sizeClassName="size-14"
                src={props.profileImageSrc}
              />
            </FrameTile>
          )
        })}
      </div>

      {selectedFrame?.description && (
        <p className="text-muted-foreground text-xs">
          {selectedFrame.name}: {selectedFrame.description}
        </p>
      )}
    </div>
  )
}

function FrameTile(props: {
  label: string
  lockLabel?: string
  isSelected: boolean
  isAllowed: boolean
  onSelect: () => void
  onHoverChange?: (isHovered: boolean) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={props.isSelected}
      disabled={!props.isAllowed}
      onClick={props.onSelect}
      onMouseEnter={() => props.onHoverChange?.(true)}
      onMouseLeave={() => props.onHoverChange?.(false)}
      className={cn(
        "relative flex flex-col items-center gap-1 overflow-hidden rounded-xl border px-1 pt-4 pb-2 text-center transition-colors disabled:cursor-not-allowed",
        props.isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "enabled:hover:bg-muted/60",
      )}
    >
      {props.isSelected && (
        <span className="absolute top-1 right-1 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" />
        </span>
      )}
      {!props.isAllowed && (
        <span className="absolute top-1 left-1 z-10 flex items-center gap-0.5 rounded bg-background/90 px-1 py-0.5 text-[10px] text-muted-foreground">
          <Lock className="size-2.5" />
          {props.lockLabel}
        </span>
      )}
      {/* 装飾がアイコンの外にはみ出すぶんの余白 */}
      <span className="flex size-[84px] items-center justify-center">
        {props.children}
      </span>
      <span className="line-clamp-2 min-h-8 text-xs leading-4">
        {props.label}
      </span>
    </button>
  )
}
