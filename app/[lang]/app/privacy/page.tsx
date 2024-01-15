import { join } from "path"
import { AppFooter } from "@/app/[lang]/app/_components/app-footer"
import { AppMarkdown } from "@/components/app/app-markdown"
import { AppPageCenter } from "@/components/app/app-page-center"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const AppPrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "app/[lang]/flutter/_assets/privacy.md"),
    "utf-8",
  )

  return (
    <>
      <AppPageCenter>
        <div className="py-8 space-y-8">
          <h1 className="text-2xl font-bold">{"プライバシー・ポリシー"}</h1>
          <AppMarkdown>{text}</AppMarkdown>
        </div>
      </AppPageCenter>
      <AppFooter />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "プライバシー・ポリシー",
}

export const revalidate = 60

export default AppPrivacyPage
