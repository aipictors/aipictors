import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/components/app/app-markdown"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"
import Link from "next/link"

const PrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/privacy-policy.md"),
    "utf-8",
  )

  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"お問い合わせ"}</h1>
          <h2 className="font-bold text-md">運営への問い合わせ</h2>
          <Link href="/support/chat">チャットで問い合わせる</Link>
          <h2 className="font-bold text-md">法人に関するお問い合わせ</h2>
          {"hello@aipictors.com"}
        </div>
      </AppPageCenter>
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "お問い合わせ",
}

export const revalidate = 60

export default PrivacyPage
