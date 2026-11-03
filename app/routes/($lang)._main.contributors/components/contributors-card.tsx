import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"
import type { Contributor } from "~/routes/($lang)._main.contributors/types/contributor"
import { Link } from "~/lib/app/locale-router"
import { RiTwitterXLine } from "@remixicon/react"
import { HomeIcon } from "lucide-react"

type Props = {
  user: Contributor
}

/**
 * コントリビュータのカード
 */
export function ContributorCard (props: Props) {
  return (
    <div className="group motion-safe:hover:-translate-y-0.5 relative transition-transform duration-200">
      <Card className="relative z-10 h-full">
        <div className="flex gap-3 p-2">
          <Link
            aria-label={props.user.name}
            target="_blank"
            rel="noreferrer"
            className="block size-24 shrink-0 md:size-40"
            to={
              props.user.xId === null && props.user.aipictorsId === null
                ? ""
                : props.user.aipictorsId === null
                  ? `https://x.com/${props.user.xId}`
                  : `https://www.aipictors.com/users/${props.user.aipictorsId}`
            }
          >
            <img
              alt={props.user.name}
              src={props.user.iconImageURL}
              width={160}
              height={160}
              loading="lazy"
              decoding="async"
              className="size-full rounded object-contain shadow-xl"
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden px-1 pt-2 md:gap-3">
            <h3 className="font-bold text-sm">{props.user.name}</h3>
            <p className="min-w-0 flex-1 text-muted-foreground text-sm">
              {props.user.message}
            </p>
            <div className="flex flex-wrap gap-1">
              {props.user.homeUrl !== null && (
                <Button asChild size={"icon"} variant={"outline"} className="size-11">
                  <Link
                    to={props.user.homeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${props.user.name} Website`}
                  >
                    <HomeIcon />
                  </Link>
                </Button>
              )}
              {props.user.xId !== null && (
                <Button asChild size={"icon"} variant={"outline"} className="size-11">
                  <Link
                    to={`https://x.com/${props.user.xId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${props.user.name} X`}
                  >
                    <RiTwitterXLine />
                  </Link>
                </Button>
              )}
              {props.user.aipictorsId !== null &&
                props.user.aipictorsId !== "" && (
                  <Button asChild size={"icon"} variant={"outline"} className="size-11">
                    <Link
                      to={`/users/${props.user.aipictorsId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${props.user.name} Aipictors`}
                    >
                      <img
                        src="/icon.svg"
                        className="size-4"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </Link>
                  </Button>
                )}
            </div>
          </div>
        </div>
      </Card>
      <div className="-inset-1 absolute z-0 rounded-lg bg-linear-to-r from-red-600 to-violet-600 opacity-25 blur-sm transition duration-1000 group-hover:opacity-60 group-hover:duration-200 dark:opacity-50" />
    </div>
  )
}
