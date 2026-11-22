import { Clock, Images, MessageSquareText, Trophy } from "lucide-react"
import {
  CoinPrice,
  type RequestUser,
  RequestUserChip,
} from "~/components/requests/request-ui"
import { useAutoTranslation } from "~/hooks/use-auto-translation"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import {
  isOpenRequestAwarded,
  type OpenRequest,
  type OpenRequestStatus,
  openRequestStatusLabel,
} from "~/lib/open-requests-api"
import { formatRemaining } from "~/lib/requests-api"
import { cn } from "~/lib/utils"

/** 募集リクエストの画面で使う部品 */

export function OpenRequestStatusBadge(props: {
  status: OpenRequestStatus
  className?: string
}) {
  const t = useTranslation()
  const color =
    props.status === "OPEN"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
      : isOpenRequestAwarded(props.status)
        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
        : "bg-muted text-muted-foreground"
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-[11px]",
        color,
        props.className,
      )}
    >
      {isOpenRequestAwarded(props.status) && <Trophy className="size-3" />}
      {openRequestStatusLabel(props.status, t.isEnglish)}
    </span>
  )
}

/** 募集のカード（一覧） */
export function OpenRequestCard(props: {
  request: OpenRequest
  user?: RequestUser | null
}) {
  const t = useTranslation()
  const { request } = props
  const title = useAutoTranslation(request.title).text
  const images = request.previewImageUrls ?? []
  const cover =
    images.length > 0 ? images : request.referenceImageUrls.slice(0, 1)
  return (
    <Link
      to={`/requests/open/${request.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md active:scale-[0.99]"
    >
      <div className="relative grid aspect-[4/3] w-full grid-cols-3 gap-0.5 overflow-hidden bg-muted">
        {cover.length === 0 ? (
          <div className="col-span-3 flex items-center justify-center text-muted-foreground">
            <Images className="size-8 opacity-40" />
          </div>
        ) : (
          cover.map((url, i) => (
            <img
              key={url}
              src={url}
              alt=""
              loading="lazy"
              className={cn(
                "size-full object-cover",
                cover.length === 1 && "col-span-3",
                cover.length === 2 && (i === 0 ? "col-span-2" : "col-span-1"),
                images.length === 0 && "opacity-60 blur-[1px]",
              )}
            />
          ))
        )}
        <OpenRequestStatusBadge
          status={request.status}
          className="absolute top-2 left-2 shadow-sm"
        />
        {request.isR18 && (
          <span className="absolute top-2 right-2 rounded-full bg-rose-500 px-2 py-0.5 font-bold text-[10px] text-white">
            R18
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 font-bold text-sm leading-snug">{title}</p>
        {props.user && <RequestUserChip user={props.user} link={false} />}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-1">
          <CoinPrice coins={request.rewardCoins} className="text-base" />
          <span className="flex items-center gap-2 whitespace-nowrap text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-0.5">
              <MessageSquareText className="size-3.5" />
              {request.proposalCount}
            </span>
            {request.status === "OPEN" && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="size-3.5" />
                {formatRemaining(request.deadlineAt, t.isEnglish)}
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  )
}
