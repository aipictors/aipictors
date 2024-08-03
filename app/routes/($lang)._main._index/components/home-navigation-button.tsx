import { Button } from "~/components/ui/button"
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

export const HomeNavigationButton = forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    if (props.isDisabled) {
      return (
        <Button
          ref={ref}
          variant={"ghost"}
          disabled={true}
          size={"sm"}
          className="w-full justify-start"
        >
          {props.icon && <props.icon className="mr-4 w-4" />}
          {props.children}
        </Button>
      )
    }

    if (props.href === undefined) {
      return (
        <Button
          ref={ref}
          variant={"ghost"}
          className="w-full justify-start"
          size={"sm"}
          onClick={props.onClick}
        >
          {props.icon && <props.icon className="mr-4 w-4" />}
          {props.children}
        </Button>
      )
    }

    if (props.href.startsWith("http")) {
      return (
        <Link
          className="block"
          to={props.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant={"ghost"}
            size={"sm"}
            className="w-full justify-start"
            onClick={props.onClick}
          >
            {props.icon && <props.icon className="mr-4 w-4" />}
            {props.children}
          </Button>
        </Link>
      )
    }

    return (
      <Link className="block" to={props.href}>
        <Button
          variant={"ghost"}
          className="w-full justify-start"
          size={"sm"}
          disabled={props.isDisabled}
          onClick={props.onClick}
        >
          {props.icon && <props.icon className="mr-4 w-4" />}
          {props.children}
        </Button>
      </Link>
    )
  },
)
