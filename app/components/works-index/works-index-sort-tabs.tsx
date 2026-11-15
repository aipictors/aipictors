import {
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  label: string
  current: string
  items: readonly {
    value: string
    label: readonly [string, string]
    href: string
  }[]
}

/**
 * 並び順の切り替え（リンクなので hydration の前でも動く）
 */
export function WorksIndexSortTabs(props: Props) {
  const t = useTranslation()

  return (
    <nav
      aria-label={props.label}
      className={`w-full sm:w-fit ${appPillRowClassName}`}
    >
      {props.items.map((item) => (
        <Link
          key={item.value}
          to={item.href}
          preventScrollReset={true}
          aria-current={item.value === props.current ? "page" : undefined}
          className={appPillTabClassName(item.value === props.current)}
        >
          {t(item.label[0], item.label[1])}
        </Link>
      ))}
    </nav>
  )
}
