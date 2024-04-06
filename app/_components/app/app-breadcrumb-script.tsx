"use client"

import type { BreadcrumbList, WithContext } from "schema-dts"

type Props = {
  breadcrumb: WithContext<BreadcrumbList>
}

export const AppBreadcrumbScript = (props: Props) => {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.breadcrumb) }}
    />
  )
}
