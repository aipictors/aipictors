import { Link } from "~/lib/app/locale-router"
import {
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  ImageIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useTranslation } from "~/hooks/use-translation"
import { toDateText } from "~/utils/to-date-text"

type Props = {
  to: string
  title: string
  thumbnailUrl?: string | null
  worksCount?: number | null
  createdAt: number
  onDelete: () => void
}

/**
 * シリーズ・コレクションのカード
 */
export function MyCollectionCard(props: Props): React.ReactNode {
  const t = useTranslation()
  return (
    <li className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <div className="relative">
        <Link to={props.to} className="block">
          {props.thumbnailUrl ? (
            <img
              src={props.thumbnailUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full bg-muted object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
        </Link>
        {typeof props.worksCount === "number" && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 font-medium text-[11px] text-white tabular-nums">
            {t(`${props.worksCount}作品`, `${props.worksCount} works`)}
          </span>
        )}
      </div>
      <div className="flex items-start gap-1 p-2.5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <Link
            to={props.to}
            className="line-clamp-2 break-all font-semibold text-sm leading-snug hover:underline"
          >
            {props.title}
          </Link>
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {toDateText(props.createdAt)}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={t("その他の操作", "More actions")}
              className="-mr-1 size-8 shrink-0 rounded-full"
            >
              <EllipsisIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={props.to}>
                <ExternalLinkIcon className="mr-2 size-4" />
                {t("開く", "Open")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void navigator.clipboard
                  .writeText(`${window.location.origin}${props.to}`)
                  .then(() => toast(t("URLをコピーしました", "URL copied")))
              }}
            >
              <CopyIcon className="mr-2 size-4" />
              {t("URLをコピー", "Copy URL")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={props.onDelete}
            >
              <Trash2Icon className="mr-2 size-4" />
              {t("削除する", "Delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  )
}

export const MY_COLLECTION_GRID_CLASS =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"

/**
 * 読み込み中の枠
 */
export function MyCollectionGridSkeleton(): React.ReactNode {
  return (
    <ul aria-hidden className={MY_COLLECTION_GRID_CLASS}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
        <li
          key={index}
          className="animate-pulse overflow-hidden rounded-xl border"
        >
          <div className="aspect-[4/3] bg-muted" />
          <div className="space-y-2 p-2.5">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-2.5 w-1/3 rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  )
}
