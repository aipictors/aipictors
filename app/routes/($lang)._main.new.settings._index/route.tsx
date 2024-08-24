import { json } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { UserSettingsForm } from "~/routes/($lang)._main.new.settings._index/components/user-settings-form"

/**
 * ユーザ設定新規作成ページ
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
  return createMeta(META.NEW_SETTINGS)
}

export default function NewSettingsPage() {
  return <UserSettingsForm />
}
