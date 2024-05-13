import { redirect } from "@remix-run/cloudflare"

export function loader() {
  const pageURL = "https://api.aipictors.com/sitemap"

  return redirect(pageURL)
}
