"use client"

import type { EventUser } from "@/app/[lang]/events/_types/event-user"
import { EventUserTag } from "@/app/[lang]/events/wakiaiai/_components/event-user-tag"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Config } from "@/config"
import { getAnalytics, logEvent } from "firebase/analytics"
import { ExternalLink, MousePointerClick } from "lucide-react"
import { TbBrandXFilled } from "react-icons/tb"

type Props = {
  user: EventUser
}

export const EventCreatorCard = (props: Props) => {
  return (
    <Card>
      <div className="flex space-x-2">
        <div className="min-w-fit w-40 h-40">
          {/* biome-ignore lint/a11y/useValidAnchor: TODO: 対応 */}
          <a
            aria-label="Twitter"
            target="_blank"
            rel="noreferrer"
            href={
              props.user.twitterId === null
                ? undefined
                : props.user.aipictorsId === null
                  ? `https://twitter.com/${props.user.twitterId}`
                  : `https://www.aipictors.com/user/?id=${props.user.aipictorsId}`
            }
            onClick={() => {
              logEvent(getAnalytics(), Config.logEvent.select_item, {
                item_list_id: props.user.twitterId ?? "-",
                item_list_name: props.user.name,
              })
            }}
          >
            <img
              alt={props.user.name}
              src={props.user.iconImageURL}
              className="h-full rounded shadow-xl w-full"
            />
          </a>
        </div>
        <div className="px-2 md:px-2 space-y-2 md:space-y-4 h-full pt-4 overflow-hidden flex flex-col">
          <div className="flex-1 space-y-2 sm:space-y-4">
            <div className="flex space-x-1 sm:space-x-2">
              {props.user.types.map((type) => (
                <EventUserTag key={type} type={type} />
              ))}
            </div>
            <h2 className="font-bold text-sm">{props.user.name}</h2>
          </div>
          <div className="flex space-x-2">
            {props.user.twitterId !== null && (
              <a
                href={`https://twitter.com/${props.user.twitterId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size={"icon"} variant={"outline"}>
                  <TbBrandXFilled />
                </Button>
              </a>
            )}
            {props.user.siteURL !== null && props.user.siteTitle !== null && (
              <a
                href={props.user.siteURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant={"outline"}>
                  <MousePointerClick className="mr-2" />
                  {props.user.siteTitle}
                </Button>
              </a>
            )}
            {props.user.siteURL !== null && props.user.siteTitle === null && (
              <a
                href={props.user.siteURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant={"outline"}>
                  <ExternalLink />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
