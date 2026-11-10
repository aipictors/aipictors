import { FollowerList } from "~/routes/($lang).followers._index/components/follower-list"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { config, META } from "~/config"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"

export const meta: MetaFunction = (props) => {
  return createSensitiveMeta(META.FOLLOWERS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  return {}
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

export default function FollowersSensitiveLayout () {
  return <FollowerList />
}
