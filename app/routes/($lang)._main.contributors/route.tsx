import { ContributorsView } from "@/routes/($lang)._main.contributors/_components/contributors-view"
import type { MetaFunction } from "@remix-run/cloudflare"

export const meta: MetaFunction = () => {
  return [
    { title: "Aipictors Contributors" },
    { description: "Aipictorsのコントリビュータ一覧です" },
    { property: "og:title", content: "Aipictors Contributors" },
    {
      property: "og:description",
      content: "Aipictorsのコントリビュータ一覧です",
    },
    {
      property: "og:image",
      content:
        "https://www.aipictors.com/wp-content/uploads/2024/03/60f40ea7-ab71-496e-9e88-cb16f655a230-1.webp",
    },
    { name: "twitter:title", content: "Aipictors Contributors" },
    {
      name: "twitter:description",
      content: "Aipictorsのコントリビュータ一覧です",
    },
  ]
}

/**
 * コントリビュータ一覧ページ
 */
export default function Contributors() {
  return <ContributorsView />
}
