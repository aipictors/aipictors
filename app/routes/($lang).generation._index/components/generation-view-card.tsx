import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Card } from "~/components/ui/card"

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
  return (
    <>
      <div className="block md:hidden">
        <div className="flex justify-between px-0 pt-1 pb-1 md:px-4">
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
      <Card className="hidden h-full w-full max-w-none flex-col overflow-hidden md:flex">
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
    </>
  )
}
