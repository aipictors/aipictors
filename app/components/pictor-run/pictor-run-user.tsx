import { CommentAchievementChip } from "~/components/achievements/comment-achievement-chip"
import type { PictorRunUser } from "~/components/pictor-run/pictor-run-api"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type AvatarProps = Readonly<{
  user: PictorRunUser
  size: number
}>

/**
 * チャットとランキングに出す利用者のアイコン（押すとその人のページを別のタブで開く）
 */
export function PictorRunAvatar(props: AvatarProps): React.ReactNode {
  const image = (
    <img
      src={withIconUrlFallback(props.user.iconUrl)}
      alt=""
      width={props.size}
      height={props.size}
      loading="lazy"
      decoding="async"
      className="shrink-0 rounded-full bg-slate-200 object-cover"
      style={{ width: props.size, height: props.size }}
    />
  )
  if (!props.user.login) return image
  return (
    <a
      href={`/users/${props.user.login}`}
      target="_blank"
      rel="noreferrer"
      className="shrink-0"
      aria-label={props.user.name}
    >
      {image}
    </a>
  )
}

type NameProps = Readonly<{
  user: PictorRunUser
}>

/**
 * 名前と、コメント欄と同じ実績のバッジ
 */
export function PictorRunUserName(props: NameProps): React.ReactNode {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate font-bold text-sm">{props.user.name}</span>
      <CommentAchievementChip userId={props.user.id} badge={props.user.badge} />
    </span>
  )
}
