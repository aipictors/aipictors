import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { createAdminReleaseAction } from "~/lib/server/admin-release.server"

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function loader(_props: LoaderFunctionArgs) {
  return toJsonResponse({ error: "Method not allowed", data: null }, 405)
}

export async function action(props: ActionFunctionArgs) {
  return createAdminReleaseAction(props)
}