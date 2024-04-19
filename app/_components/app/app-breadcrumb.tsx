import { config } from "@/config"
import { Link } from "@remix-run/react"
import type { BreadcrumbList, WithContext } from "schema-dts"

type Props = {
  breadcrumb: WithContext<BreadcrumbList>
}

export const AppBreadcrumb = (props: Props) => {
  if (!Array.isArray(props.breadcrumb.itemListElement)) {
    return null
  }

  const length = props.breadcrumb.itemListElement.length

  return (
    <div className="overflow-x-auto">
      <nav className="flex space-x-2">
        {props.breadcrumb.itemListElement.map((item, index) => (
          // biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
          <>
            <Link
              to={
                item.item === config.siteURL
                  ? "/"
                  : item.item.replace(config.siteURL, "")
              }
              className="hover:underline"
            >
              {item.name}
            </Link>
            {index === length - 1 ? null : <span className="mx-2">{"/"}</span>}
          </>
        ))}
      </nav>
    </div>
  )
}
