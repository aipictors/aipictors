import { json } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/cloudflare"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"
import { ProfileEditorForm } from "~/routes/($lang)._main.new.profile._index/components/profile-editor-form"

/**
 * プロフィール新規作成ページ
 */
export async function loader() {
  // const client = createClient()

  // const resp = await loaderClient.query({
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
  return <ProfileEditorForm />
}
