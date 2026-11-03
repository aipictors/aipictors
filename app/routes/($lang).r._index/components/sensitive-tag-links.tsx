import { useLocation } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { getLocalePrefix } from "~/routes/($lang)._main._index/utils/content-rating-path"

type Props = {
  title: string
  tagNames: string[]
}

/**
 * タグへのリンクの一覧（サーバーの HTML に入る内部リンク）
 * 渡す前に isSuggestableSensitiveTag で絞ること
 */
export function SensitiveTagLinks(props: Props): React.ReactNode {
  const location = useLocation()
  const localePrefix = getLocalePrefix(location.pathname)

  if (props.tagNames.length === 0) {
    return null
  }

  return (
    <section className="space-y-2">
      <h2 className="font-bold text-base">{props.title}</h2>
      <ul className="flex flex-wrap gap-2">
        {props.tagNames.map((tagName) => (
          <li key={tagName}>
            <Link
              to={`${localePrefix}/r/tags/${encodeURIComponent(tagName)}`}
              className="inline-flex h-8 items-center rounded-full bg-muted px-3 text-sm transition-colors hover:bg-muted/70"
            >
              #{tagName}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
