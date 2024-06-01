import { DropdownMenuItem } from "@/_components/ui/dropdown-menu"
import { Link } from "@remix-run/react"

type Props = {
  href: string
  icon: React.ReactNode
  label: string
}

/**
 * メニュー項目
 */
export const MenuItemLink = (props: Props) => {
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
