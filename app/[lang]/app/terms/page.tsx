import { join } from "path"
import { AppTermsDocument } from "app/[lang]/app/terms/_components/AppTermsDocument"
import { MainCenterPage } from "app/_components/MainCenterPage"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const AppTermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/terms.md"),
    "utf-8",
  )

  return (
    <MainCenterPage>
      <AppTermsDocument text={text} />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "利用規約",
}

export const revalidate = 60

export default AppTermsPage
