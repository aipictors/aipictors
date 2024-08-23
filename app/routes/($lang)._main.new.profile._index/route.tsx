import { json } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { SettingProfileForm } from "~/routes/($lang)._main.new.profile._index/components/pofile-editor-form"

/**
 * モデルの一覧
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
  return createMeta(META.NEW_PROFILE)
}

export default function NewProfilePage() {
  return <SettingProfileForm />
}
