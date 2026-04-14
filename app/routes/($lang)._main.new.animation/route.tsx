import { redirect, type HeadersFunction, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import type { MetaFunction } from "@remix-run/react"
import { META } from "~/config"
import { createMeta } from "~/utils/create-meta"

export default function NewAnimation() {
  return null
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.NEW_ANIMATION, undefined, props.params.lang)
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  url.pathname = url.pathname.replace(/\/new\/animation$/, "/new/image")
  url.searchParams.set("media", "video")

  return redirect(url.toString())
}

export const headers: HeadersFunction = () => ({})
