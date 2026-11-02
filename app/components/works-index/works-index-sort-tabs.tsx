import { Link } from "@remix-run/react"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"

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
      className="inline-flex w-fit max-w-full rounded-full border bg-muted/40 p-0.5"
    >
      {props.items.map((item) => (
        <Link
          key={item.value}
          to={item.href}
          preventScrollReset={true}
          aria-current={item.value === props.current ? "page" : undefined}
          className={cn(
            "flex h-8 items-center whitespace-nowrap rounded-full px-3 font-medium text-xs transition-colors",
            item.value === props.current
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(item.label[0], item.label[1])}
        </Link>
      ))}
    </nav>
  )
}
