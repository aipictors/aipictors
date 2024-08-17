import { redirect } from "@remix-run/cloudflare"

export const loader = async () => {
  return redirect("/posts/2d", {
    status: 302,
  })
}
