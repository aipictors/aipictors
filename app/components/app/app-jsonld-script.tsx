import type { Thing, WithContext } from "schema-dts"

type Props = Readonly<{
  jsonLd: WithContext<Thing> | Array<WithContext<Thing>>
}>

export function AppJsonLdScript (props: Props): React.ReactNode {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(props.jsonLd) }}
    />
  )
}
