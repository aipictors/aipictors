import { json } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { SettingsCompleted } from "~/routes/($lang)._main.settings.completed._index/components/settings-completed"

/**
 * 設定完了ページ
 */
export async function loader() {
  // const client = createClient()

  // const resp = await client.query({
  //   query: imageModelsQuery,
  //   variables: {
  //     limit: 64,
  //     offset: 0,
  //   },
  // })

  return json({})
}

export const meta: MetaFunction = () => {
  return createMeta(META.COMPLETED_SETTINGS)
}

export default function NewSettingsPage() {
  return <SettingsCompleted />
}
