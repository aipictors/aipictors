import type { FragmentOf } from "gql.tada"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useEffect } from "react"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { cn } from "~/lib/utils"
import type { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article"
import { toResizedImageSrcSet } from "~/utils/resized-image-url"

type Work = FragmentOf<typeof workArticleFragment>

type NeighborWork = NonNullable<Work["nextWork"]>

type Props = {
  work: Work
  className?: string
}

declare global {
  interface Window {
    /** hydration の前に押されたキー（app/lib/defer-hydration.ts が覚える） */
    __aipictorsPendingKey?: { code: string; at: number }
  }
}

/** これより前に押されたキーは使わない */
const MAX_PENDING_KEY_MS = 5000

const isEditableElement = (element: Element | null) =>
  element instanceof HTMLElement &&
  (element.isContentEditable ||
    ["input", "textarea", "select"].includes(element.tagName.toLowerCase()))

/**
 * 前後の作品へ移るバー（作品の下・スマホでも出す）
 * - 左が新しい作品（nextWork）、右が古い作品（previousWork）
 * - Q / E キーでも移れる。1 枚だけの作品は ← → キーでも移れる（複数枚の作品の ← → は画像の切り替え）。
 *   ページは読み直さずに移る
 * - 画面に入ったら移り先を先読みしておく
 */
export function WorkPrevNextBar(props: Props) {
  const t = useTranslation()

  const navigate = useNavigate()

  const newer = props.work.nextWork
  const older = props.work.previousWork
  // 複数枚の作品では ← → キーは画像の切り替えに使う（app/components/images-preview.tsx）
  const canUseArrowKeys = props.work.subWorks.length === 0

  useEffect(() => {
    /** 押されたキーで移る。移ったら true */
    const move = (code: string) => {
      if (isEditableElement(document.activeElement)) return false
      // ダイアログ（画像の拡大表示など）が開いているときは、その中の操作に任せる
      if (document.querySelector("[role='dialog']")) return false
      const isNewer =
        code === "KeyQ" || (canUseArrowKeys && code === "ArrowLeft")
      const isOlder =
        code === "KeyE" || (canUseArrowKeys && code === "ArrowRight")
      if (isNewer && newer) {
        navigate(`/posts/${newer.id}`)
        return true
      }
      if (isOlder && older) {
        navigate(`/posts/${older.id}`)
        return true
      }
      return false
    }

    // 閲覧ページは最初の操作で hydration を始めるので、その最初のキーで移る
    const pending = window.__aipictorsPendingKey
    window.__aipictorsPendingKey = undefined
    if (pending && Date.now() - pending.at < MAX_PENDING_KEY_MS) {
      if (move(pending.code)) return
    }

    // 画像の表示（images-preview.tsx）が ← → キーを preventDefault するので、defaultPrevented は見ない
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return
      }
      if (move(event.code)) event.preventDefault()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [newer, older, canUseArrowKeys, navigate])

  if (!newer && !older) return null

  return (
    <nav
      aria-label={t("前後の作品", "Previous and next works")}
      className={cn("grid grid-cols-2 gap-3", props.className)}
    >
      {newer ? (
        <NeighborLink
          work={newer}
          direction="newer"
          label={t("新しい作品", "Newer")}
        />
      ) : (
        <div />
      )}
      {older ? (
        <NeighborLink
          work={older}
          direction="older"
          label={t("古い作品", "Older")}
        />
      ) : (
        <div />
      )}
    </nav>
  )
}

function NeighborLink(props: {
  work: NeighborWork
  direction: "newer" | "older"
  label: string
}) {
  const isOlder = props.direction === "older"

  return (
    <Link
      to={`/posts/${props.work.id}`}
      prefetch="viewport"
      className={cn(
        "group flex min-w-0 items-center gap-2 rounded-xl border bg-card p-2 transition-colors hover:bg-muted",
        isOlder && "flex-row-reverse text-right",
      )}
      title={`${props.label} ${isOlder ? "→" : "←"}`}
    >
      {isOlder ? (
        <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      ) : (
        <ChevronLeftIcon className="group-hover:-translate-x-0.5 size-5 shrink-0 text-muted-foreground transition-transform" />
      )}
      <img
        src={props.work.smallThumbnailImageURL}
        srcSet={toResizedImageSrcSet(props.work.smallThumbnailImageURL, {
          minWidth: 96,
          maxWidth: props.work.smallThumbnailImageWidth || undefined,
        })}
        sizes="96px"
        alt=""
        loading="lazy"
        decoding="async"
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-lg bg-muted object-cover"
      />
      <span className="flex min-w-0 flex-col">
        <span className="text-muted-foreground text-xs">{props.label}</span>
        <span className="truncate font-bold text-sm">{props.work.title}</span>
      </span>
    </Link>
  )
}
