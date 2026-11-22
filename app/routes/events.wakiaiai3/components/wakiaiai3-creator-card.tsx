import { Badge } from "~/components/ui/badge"
import { Card } from "~/components/ui/card"
import { config } from "~/config"
import type { EventUser } from "~/routes/events.wakiaiai/types/event-user"
import type { EventUserType } from "~/routes/events.wakiaiai/types/event-user-type"
import { RiTwitterXLine } from "@remixicon/react"
import { getAnalytics, logEvent } from "firebase/analytics"
import {
  ExternalLinkIcon,
  FlameIcon,
  ImageIcon,
  ShoppingBagIcon,
} from "lucide-react"
import type { ReactNode } from "react"

type Props = {
  user: EventUser
}

const typeLabels: Record<EventUserType, { label: string; icon: ReactNode }> =
  {
    SPONSOR: { label: "スポンサー", icon: <FlameIcon className="size-3" /> },
    EXHIBIT: { label: "展示", icon: <ImageIcon className="size-3" /> },
    SHOP: { label: "出展", icon: <ShoppingBagIcon className="size-3" /> },
  }

/**
 * 和気あいAI3 の参加クリエイター
 */
export function Wakiaiai3CreatorCard (props: Props) {
  const twitterURL =
    props.user.twitterId === null
      ? null
      : `https://x.com/${props.user.twitterId}`

  const onClickLink = () => {
    logEvent(getAnalytics(), config.logEvent.select_item, {
      item_list_id: props.user.twitterId ?? "-",
      item_list_name: props.user.name,
    })
  }

  const image = (
    <img
      alt={props.user.name}
      src={props.user.iconImageURL}
      loading="lazy"
      className="size-full object-contain"
    />
  )

  return (
    <Card className="flex items-center gap-3 overflow-hidden p-2">
      <div className="size-20 shrink-0 overflow-hidden rounded-md bg-muted sm:size-24">
        {twitterURL === null ? (
          image
        ) : (
          <a
            href={twitterURL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${props.user.name}のX`}
            onClick={onClickLink}
            className="block size-full"
          >
            {image}
          </a>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-1">
          {props.user.types.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="gap-1 px-2 font-normal"
            >
              {typeLabels[type].icon}
              {typeLabels[type].label}
            </Badge>
          ))}
        </div>
        <p className="truncate font-bold text-sm" title={props.user.name}>
          {props.user.name}
        </p>
        <div className="flex gap-2">
          {twitterURL !== null && (
            <a
              href={twitterURL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${props.user.name}のX`}
              onClick={onClickLink}
              className="inline-flex size-8 items-center justify-center rounded-md border hover:bg-accent"
            >
              <RiTwitterXLine className="size-4" />
            </a>
          )}
          {props.user.siteURL !== null && (
            <a
              href={props.user.siteURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 min-w-0 items-center gap-1 rounded-md border px-2 text-xs hover:bg-accent"
            >
              <ExternalLinkIcon className="size-4 shrink-0" />
              {props.user.siteTitle !== null && (
                <span className="truncate">{props.user.siteTitle}</span>
              )}
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}
