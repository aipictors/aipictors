import { Button } from "@/_components/ui/button"
import { Link } from "@remix-run/react"
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

const renderButtonContent = (props: Props) => (
  <>
    {props.icon && <props.icon className="mr-4 w-4" />}
    <span>{props.children}</span>
  </>
)

export const HomeNavigationButton = forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const { href, isDisabled, onClick } = props

    if (isDisabled) {
      return (
        <Button
          ref={ref}
          variant={"ghost"}
          disabled
          size={"sm"}
          className="justify-start"
        >
          {renderButtonContent(props)}
        </Button>
      )
    }

    if (!href) {
      return (
        <Button
          ref={ref}
          variant={"ghost"}
          className="justify-start"
          size={"sm"}
          onClick={onClick}
        >
          {renderButtonContent(props)}
        </Button>
      )
    }

    const isExternalLink = href.startsWith("https")
    return (
      <Button
        variant={"ghost"}
        size={"sm"}
        className="w-full justify-start"
        asChild
        disabled={isDisabled}
      >
        <Link
          className="block"
          to={href}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noopener noreferrer" : undefined}
        >
          {renderButtonContent(props)}
        </Link>
      </Button>
    )
  },
)
