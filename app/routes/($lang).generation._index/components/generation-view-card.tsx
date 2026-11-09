import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Card } from "~/components/ui/card"
import { useLayoutVariant } from "~/hooks/use-layout-variant"

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
export function GenerationViewCard (props: Props) {
  // 画面幅で片方だけを描画する（子の一覧を二重に描画しない）
  const { showDesktop, showMobile } = useLayoutVariant()

  return (
    <>
      {showMobile && <div className="block md:hidden">
        <div className="flex min-h-8 items-center justify-between px-0 pt-1 pb-1 md:px-4">
          <div className="flex items-center">
            <span className="font-semibold text-sm">{props.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            {props.action}
            {props.tooltip && (
              <CrossPlatformTooltip
                text={props?.tooltip}
                detailLink={props.tooltipDetailLink}
              />
            )}
          </div>
        </div>
        {props.children}
      </div>}
      {showDesktop && <Card className="hidden h-full w-full max-w-none flex-col overflow-hidden md:flex">
        <div className="flex min-h-11 items-center justify-between px-4 pt-2 pb-1">
          <div className="flex items-center">
            <span className="font-semibold text-sm">{props.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            {props.action}
            {props.tooltip && (
              <CrossPlatformTooltip
                text={props?.tooltip}
                detailLink={props.tooltipDetailLink}
              />
            )}
          </div>
        </div>
        {/* 子要素領域を伸縮可能にして内部スクロールを有効化 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {props.children}
        </div>
      </Card>}
    </>
  )
}
