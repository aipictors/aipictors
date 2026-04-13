import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare"

export async function loader(_props: LoaderFunctionArgs) {
  return redirect("/r/albums", { status: 301 })
}

export default function SensitiveWorks() {
  return null
}
