import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import { config } from "~/config"
import { EventWakiaiaiUserTag } from "~/routes/events.wakiaiai/components/event-wakiaiai-user-tag"
import type { EventUser } from "~/routes/events.wakiaiai/types/event-user"
import { Link } from "@remix-run/react"
import { RiTwitterXLine } from "@remixicon/react"
import { getAnalytics, logEvent } from "firebase/analytics"
import { ExternalLinkIcon, MousePointerClickIcon } from "lucide-react"

type Props = {
  user: EventUser
}

export function EventWakiaiaiCreatorCard(props: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="flex space-x-2">
        <div className="h-40 w-40 min-w-fit">
          {/* TODO: 対応 */}
          <Link
            aria-label="Twitter"
            target="_blank"
            rel="noreferrer"
            to={
              props.user.twitterId === null
                ? ""
                : props.user.aipictorsId === null
                  ? `https://twitter.com/${props.user.twitterId}`
                  : `https://www.aipictors.com/user/?id=${props.user.aipictorsId}`
            }
            onClick={() => {
              logEvent(getAnalytics(), config.logEvent.select_item, {
                item_list_id: props.user.twitterId ?? "-",
                item_list_name: props.user.name,
              })
            }}
            style={{ display: "block", width: "100%", height: "100%" }}
          >
            <img
              alt={props.user.name}
              src={props.user.iconImageURL}
              className="h-full w-full rounded shadow-xl"
              style={{ height: "100%", objectFit: "contain" }}
            />
          </Link>
        </div>
        <div className="flex h-full flex-col space-y-2 overflow-hidden px-2 pt-4 md:space-y-4 md:px-2">
          <div className="min-w-0 flex-1 space-y-2 sm:space-y-4">
            <div className="flex space-x-1 sm:space-x-2">
              {props.user.types.map((type) => (
                <EventWakiaiaiUserTag key={type} type={type} />
              ))}
            </div>
            <h2 className="font-bold text-sm">{props.user.name}</h2>
          </div>
          <div className="flex h-auto space-x-2">
            {props.user.twitterId !== null && (
              <Link
                to={`https://twitter.com/${props.user.twitterId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size={"icon"} variant={"outline"}>
                  <RiTwitterXLine />
                </Button>
              </Link>
            )}
            {props.user.siteURL !== null && props.user.siteTitle !== null && (
              <Link
                to={props.user.siteURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant={"outline"}>
                  <MousePointerClickIcon className="mr-2" />
                  {props.user.siteTitle}
                </Button>
              </Link>
            )}
            {props.user.siteURL !== null && props.user.siteTitle === null && (
              <Link
                to={props.user.siteURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant={"outline"}>
                  <ExternalLinkIcon />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
