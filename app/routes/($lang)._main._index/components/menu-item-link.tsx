import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { Link } from "@remix-run/react"
import { userNavigationStyles } from "~/routes/($lang)._main._index/components/user-navigation-styles"

type Props = {
  href: string
  icon: React.ReactNode
  label: string
}

/**
 * メニュー項目（共通スタイル使用、レスポンシブ対応）
 */
export function MenuItemLink(props: Props) {
  if (!props.href) {
    return (
      <DropdownMenuItem className={userNavigationStyles.menuItem}>
        {props.icon}
        <span
          className={`${userNavigationStyles.menuText} ${userNavigationStyles.menuItemText} truncate`}
        >
          {props.label}
        </span>
      </DropdownMenuItem>
    )
  }

  return (
    <Link to={props.href}>
      <DropdownMenuItem className={userNavigationStyles.menuItem}>
        {props.icon}
        <span
          className={`${userNavigationStyles.menuText} ${userNavigationStyles.menuItemText} truncate`}
        >
          {props.label}
        </span>
      </DropdownMenuItem>
    </Link>
  )
}
