import { config } from "~/config"
import { Link } from "@remix-run/react"
import type { BreadcrumbList, WithContext } from "schema-dts"

type Props = Readonly<{
  breadcrumb: WithContext<BreadcrumbList>
}>

export function AppBreadcrumb (props: Props): React.ReactNode {
  if (!Array.isArray(props.breadcrumb.itemListElement)) {
    return null
  }

  const length = props.breadcrumb.itemListElement.length

  return (
    <div className="overflow-x-auto">
      <nav>
        {props.breadcrumb.itemListElement.map((item, index) => (
          <div key="index" className="flex space-x-2">
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
          </div>
        ))}
      </nav>
    </div>
  )
}
