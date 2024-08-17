import { redirect } from "@remix-run/cloudflare"

export const loader = async () => {
  return redirect("/themes", {
    status: 302,
  })
}
