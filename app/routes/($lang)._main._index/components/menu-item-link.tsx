import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Link } from "@remix-run/react"

type Props = {
  href: string
  icon: React.ReactNode
  label: string
}

/**
 * メニュー項目
 */
export function MenuItemLink(props: Props) {
  if (!props.href) {
    return (
      <DropdownMenuItem>
        {props.icon}
        <span>{props.label}</span>
      </DropdownMenuItem>
    )
  }

  return (
    <>
      <Link to={props.href}>
        <DropdownMenuItem>
          {props.icon}
          <span>{props.label}</span>
        </DropdownMenuItem>
      </Link>
    </>
  )
}
