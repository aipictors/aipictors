import { join } from "path"
import { FlutterPrivacyArticle } from "app/[lang]/flutter/privacy/_components/FlutterPrivacyArticle"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterPrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "app/[lang]/flutter/_assets/privacy.md"),
    "utf-8",
  )

  return <FlutterPrivacyArticle text={text} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "プライバシー・ポリシー" },
}

export const revalidate = 240

export default FlutterPrivacyPage
