import type { BreadcrumbList, WithContext } from "schema-dts"

type Props = Readonly<{
  breadcrumb: WithContext<BreadcrumbList>
}>

export function AppBreadcrumbScript (props: Props): React.ReactNode {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.breadcrumb) }}
    />
  )
}
