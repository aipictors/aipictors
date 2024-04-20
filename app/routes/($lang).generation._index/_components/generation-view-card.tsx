import { CrossPlatformTooltip } from "@/_components/cross-platform-tooltip"
import { Card } from "@/_components/ui/card"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  title?: string
  tooltip?: string
  tooltipDetailLink?: string
  action?: React.ReactNode
  children: React.ReactNode
}

/**
 * レイアウトで使用するカード
 * @param props
 */
export const GenerationViewCard = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  if (!isDesktop) {
    return (
      <div>
        <div className="flex justify-between px-4 pt-1 pb-1">
          <div className="flex items-center">
            <span className="font-bold">{props.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            {props.tooltip && (
              <CrossPlatformTooltip
                text={props?.tooltip}
                detailLink={props.tooltipDetailLink}
              />
            )}
          </div>
        </div>
        {props.children}
      </div>
    )
  }

  return (
    <Card className="flex h-full w-full max-w-none flex-col overflow-hidden">
      <div className="flex justify-between px-4 pt-2 pb-2">
        <div className="flex items-center">
          <span className="font-bold">{props.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {props.tooltip && (
            <CrossPlatformTooltip
              text={props?.tooltip}
              detailLink={props.tooltipDetailLink}
            />
          )}
        </div>
      </div>
      {props.children}
    </Card>
  )
}
