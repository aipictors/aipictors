import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Contributor } from "@/routes/($lang)._main.contributors/types/contributor"
import { Link } from "@remix-run/react"
import { RiTwitterXLine } from "@remixicon/react"
import { HomeIcon } from "lucide-react"

type Props = {
  user: Contributor
}

/**
 * コントリビュータのカード
 */
export const ContributorCard = (props: Props) => {
  return (
    <div className="relative">
      <Card className="relative z-10 h-full">
        <div className="flex space-x-2 p-2">
          <div className="h-40 w-40 min-w-fit">
            <Link
              aria-label="Twitter"
              target="_blank"
              rel="noreferrer"
              to={
                props.user.xId === null && props.user.aipictorsId === null
                  ? ""
                  : props.user.aipictorsId === null
                    ? `https://x.com/${props.user.xId}`
                    : `https://www.aipictors.com/users/${props.user.aipictorsId}`
              }
              style={{ display: "block", width: "100%", height: "100%" }}
            >
              <img
                alt={props.user.name}
                src={props.user.iconImageURL}
                className="h-24 w-24 rounded shadow-xl md:h-full md:w-full"
                style={{ height: "100%", objectFit: "contain" }}
              />
            </Link>
          </div>
          <div className="flex h-full flex-col space-y-2 overflow-hidden px-2 pt-4 md:space-y-4 md:px-2">
            <div className="min-w-0 flex-1 space-y-2 sm:space-y-4">
              <h2 className="font-bold text-sm">{props.user.name}</h2>
            </div>
            <div className="min-w-0 flex-1 space-y-2 sm:space-y-4">
              <p className="font-bold text-sm">{props.user.message}</p>
            </div>
            <div className="flex h-auto space-x-2">
              {props.user.homeUrl !== null && (
                <Link
                  to={props.user.homeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size={"icon"} variant={"outline"}>
                    <HomeIcon />
                  </Button>
                </Link>
              )}
              {props.user.xId !== null && (
                <Link
                  to={`https://x.com/${props.user.xId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size={"icon"} variant={"outline"}>
                    <RiTwitterXLine />
                  </Button>
                </Link>
              )}
              {props.user.aipictorsId !== null &&
                props.user.aipictorsId !== "" && (
                  <Link
                    to={`/users/${props.user.aipictorsId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant={"outline"}>
                      <img
                        src="/icon.svg"
                        cmr-2
                        className="ro-full h-4 w-4"
                        alt="aipictors-icon"
                        width={32}
                        height={32}
                      />
                    </Button>
                  </Link>
                )}
            </div>
          </div>
        </div>
      </Card>
      <div className="-inset-1 absolute z-0 rounded-lg bg-gradient-to-r from-red-600 to-violet-600 opacity-25 blur transition duration-1000 group-hover:opacity-90 group-hover:duration-200 dark:opacity-75" />
    </div>
  )
}
