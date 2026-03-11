import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"
import { UserEventEditorPage } from "~/routes/($lang).events/components/user-event-editor-page"

export const meta: MetaFunction = (props) => {
  return createMeta(META.EVENTS_INDEX, {
    title: "ユーザーイベント作成",
  }, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({})

export default function NewUserEventRoute () {
  return <UserEventEditorPage mode="create" />
}
