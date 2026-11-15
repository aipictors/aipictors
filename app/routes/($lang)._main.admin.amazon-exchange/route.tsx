import { redirect } from "@remix-run/cloudflare"

// Amazon ギフト券交換は 2026-11-16 に終了。クリエイター報酬の振込（承認キュー）へ
export async function loader() {
  return redirect("/admin/creator-payouts", 301)
}
