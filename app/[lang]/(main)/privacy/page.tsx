import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppMarkdown } from "@/components/app/app-markdown"
import { AppPageCenter } from "@/components/app/app-page-center"
import type { Metadata } from "next"

const PrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/privacy-policy.md"),
    "utf-8",
  )

  return (
    <>
      <AppPageCenter>
        <div className="w-full space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"プライバシーポリシー"}</h1>
          <AppMarkdown>{text}</AppMarkdown>
        </div>
      </AppPageCenter>
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "プライバシーポリシー",
}

export default PrivacyPage
