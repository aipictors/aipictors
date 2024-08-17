import { redirect } from "@remix-run/cloudflare"

export const loader = async () => {
  return redirect("/stickers", {
    status: 302,
  })
}
