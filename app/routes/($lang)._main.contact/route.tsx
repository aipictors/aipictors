import { AppPageCenter } from "@/_components/app/app-page-center"
import type { MetaFunction } from "@remix-run/cloudflare"
import { Link } from "@remix-run/react"

export const meta: MetaFunction = () => {
  return [{ title: "お問い合わせ" }]
}

export default function Contact() {
  return (
    <AppPageCenter>
      <div className="w-full space-y-8 py-8">
        <h1 className="font-bold text-2xl">{"お問い合わせ"}</h1>
        <h2 className="font-bold text-md">運営への問い合わせ</h2>
        <Link to="/support/chat">チャットで問い合わせる</Link>
        <h2 className="font-bold text-md">法人に関するお問い合わせ</h2>
        {"hello@aipictors.com"}
      </div>
    </AppPageCenter>
  )
}
