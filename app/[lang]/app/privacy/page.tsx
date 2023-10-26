import { join } from "path"
import { AppPrivacyDocument } from "app/[lang]/app/privacy/_components/AppPrivacyDocument"
import { MainCenterPage } from "app/_components/MainCenterPage"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const AppPrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/privacy.md"),
    "utf-8",
  )

  return (
    <MainCenterPage>
      <AppPrivacyDocument text={text} />
    </MainCenterPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "プライバシー・ポリシー",
}

export const revalidate = 60

export default AppPrivacyPage
