import { AppPlaceholder } from "@/_components/app/app-placeholder"
import type { MetaFunction } from "@remix-run/cloudflare"
import type { Metadata } from "next"

export default function SensitivePage() {
  return <AppPlaceholder>{"センシティブ"}</AppPlaceholder>
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const meta: MetaFunction = () => {
  return [{ name: "robots", content: "noindex" }, { title: "-" }]
}
