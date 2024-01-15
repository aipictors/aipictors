import { Config } from "@/config"
import Link from "next/link"
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
          <>
            <Link
              href={
                item.item === Config.siteURL
                  ? "/"
                  : item.item.replace(Config.siteURL, "")
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
