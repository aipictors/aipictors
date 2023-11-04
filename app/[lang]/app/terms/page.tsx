import { join } from "path"
import { AppFooter } from "app/[lang]/app/_components/AppFooter"
import { AppTermsDocument } from "app/[lang]/app/terms/_components/AppTermsDocument"
import { MainCenterPage } from "app/_components/pages/MainCenterPage"
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
        <AppTermsDocument text={text} />
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
