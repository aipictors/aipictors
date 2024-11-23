import { redirect } from "react-router";

export function loader() {
  const pageURL = "https://api.aipictors.com/sitemap"

  return redirect(pageURL)
}
