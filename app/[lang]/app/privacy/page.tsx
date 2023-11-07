import { join } from "path"
import { AppFooter } from "app/[lang]/app/_components/AppFooter"
import { AppPrivacyDocument } from "app/[lang]/app/privacy/_components/AppPrivacyDocument"
import { MainCenterPage } from "app/_components/page/MainCenterPage"
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
        <AppPrivacyDocument text={text} />
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
