import { redirect } from "@remix-run/cloudflare"

export const loader = async () => {
  return redirect("/posts/3d", {
    status: 302,
  })
}
