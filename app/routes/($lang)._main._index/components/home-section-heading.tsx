import { RiQuestionLine } from "@remixicon/react"
import { ChevronRightIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Link } from "~/lib/app/locale-router"

type Props = {
  title: string
  /** 見出しの下に出す短い説明 */
  description?: React.ReactNode
  tooltip?: string
  link?: string
  linkLabel?: string
}

/**
 * ホームの各欄の見出し（左の色の帯で欄の始まりが分かるようにする。右に一覧への導線）
 */
export function HomeSectionHeading(props: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 font-bold text-lg leading-tight md:text-xl">
          <span
            aria-hidden="true"
            className="h-5 w-1 shrink-0 rounded-full bg-linear-to-b from-sky-400 to-violet-500"
          />
          <span className="min-w-0 truncate">{props.title}</span>
          {props.tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="inline h-6 w-auto shrink-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </h2>
        {props.description && (
          <p className="mt-1 line-clamp-1 pl-3 text-muted-foreground text-xs md:text-sm">
            {props.description}
          </p>
        )}
      </div>
      {props.link && props.linkLabel && (
        <Link
          to={props.link}
          className="flex h-8 shrink-0 items-center gap-0.5 rounded-full border bg-background pr-2 pl-3.5 font-medium text-xs transition-colors hover:bg-muted"
        >
          {props.linkLabel}
          <ChevronRightIcon className="size-3.5 text-muted-foreground" />
        </Link>
      )}
    </div>
  )
}
