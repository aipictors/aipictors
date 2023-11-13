import { join } from "path"
import { AppFooter } from "@/app/[lang]/app/_components/app-footer"
import { MarkdownDocument } from "@/app/_components/markdown-document"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const AppPrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "app/[lang]/flutter/_assets/privacy.md"),
    "utf-8",
  )

  return (
    <>
      <MainCenterPage>
        <div className="py-8 space-y-8">
          <h1 className="text-2xl font-bold">{"プライバシー・ポリシー"}</h1>
          <MarkdownDocument>{text}</MarkdownDocument>
        </div>
      </MainCenterPage>
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
