import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useParams } from "@remix-run/react"
import { RedirectType, redirect } from "next/navigation"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.id === undefined) {
    throw new Response(null, { status: 404 })
  }

  redirect(`/albums/${props.params.id}`, RedirectType.replace)
  return {
    id: props.params.id,
  }
}

export default function RedirectsSeries() {
  const params = useParams()

  if (params.id === undefined) {
    throw new Error()
  }

  return []
}
