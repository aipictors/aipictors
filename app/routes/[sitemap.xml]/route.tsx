import { redirect } from "@remix-run/cloudflare"

export function loader() {
  const pageURL = "https://sitemap-6ouzjmdzha-an.a.run.app/aipictors"

  return redirect(pageURL)
}
