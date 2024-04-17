import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/_components/ui/tooltip"
import { config } from "@/config"
import { Link } from "@remix-run/react"
import { HelpCircleIcon } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  text: string
  detailLink?: string
  isTargetBlank?: boolean
}

/**
 * PCとスマホの両方で使えるツールチップ
 * @returns
 */
export const CrossPlatformTooltip = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      {isDesktop ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircleIcon className="w-4" />
            </TooltipTrigger>
            <TooltipContent className="whitespace-pre-wrap font-size-md">
              {props.text}
              {props.detailLink && !props.isTargetBlank && (
                <Link to={props.detailLink}>{"(詳細)"}</Link>
              )}
              {props.detailLink && props.isTargetBlank === true && (
                <Link
                  to={props.detailLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {"(詳細)"}
                </Link>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <HelpCircleIcon className="w-4" />
          </PopoverTrigger>
          <PopoverContent className="whitespace-pre-wrap font-size-md">
            {props.text}
            {props.detailLink && <Link to={props.detailLink}>{"(詳細)"}</Link>}
          </PopoverContent>
        </Popover>
      )}
    </>
  )
}
