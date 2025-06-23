import { Button } from "~/components/ui/button"
import type { RemixiconComponentType } from "@remixicon/react"
import type { LucideIcon } from "lucide-react"
import { forwardRef } from "react"

type Props = {
  icon?: LucideIcon | RemixiconComponentType
  href?: string
  children: React.ReactNode
  onClick?(): void
  isDisabled?: boolean
}

export const SettingNavigationButton = forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const handleClick = (_event: React.MouseEvent<HTMLButtonElement>) => {
      // 任意の onClick を実行
      if (props.onClick) {
        props.onClick()
      }
      // href が指定されている場合、リンク遷移を実行
      if (props.href) {
        if (props.href.startsWith("http")) {
          window.open(props.href, "_blank", "noopener,noreferrer")
        } else {
          window.location.href = props.href
        }
      }
    }

    return (
      <Button
        ref={ref}
        variant={"ghost"}
        size={"sm"}
        className="w-full justify-start"
        disabled={props.isDisabled}
        onClick={!props.isDisabled ? handleClick : undefined}
      >
        {props.icon && <props.icon className="mr-4 w-4" />}
        {props.children}
      </Button>
    )
  },
)
