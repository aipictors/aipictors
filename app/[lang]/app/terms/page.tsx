import { join } from "path"
import { AppFooter } from "@/app/[lang]/app/_components/app-footer"

import { MarkdownDocument } from "@/app/_components/markdown-document"
import { MainCenterPage } from "@/app/_components/page/main-center-page"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const AppTermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "app/[lang]/flutter/_assets/terms.md"),
    "utf-8",
  )

  return (
    <>
      <MainCenterPage>
        <div className="py-8 space-y-8">
          <h1 className="text-2xl font-bold"> {"利用規約"}</h1>
          <MarkdownDocument>{text}</MarkdownDocument>
        </div>
      </MainCenterPage>
      <AppFooter />
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "利用規約",
}

export const revalidate = 60

export default AppTermsPage
