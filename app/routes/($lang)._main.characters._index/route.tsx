import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"

export const meta: MetaFunction = () => {
  return [
    { title: "404 - Aipictors" },
    { name: "robots", content: "noindex" },
  ]
}

export async function loader(_args: LoaderFunctionArgs) {
  throw new Response("Not Found", { status: 404 })
}

export default function CharactersIndex () {
  return null
}
