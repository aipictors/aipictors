import { join } from "path"
import { MainFlutterPrivacy } from "app/[lang]/flutter/privacy/components/MainFlutterPrivacy"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterPrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/privacy.md"),
    "utf-8",
  )

  return <MainFlutterPrivacy text={text} />
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "プライバシー・ポリシー" },
}

export const revalidate = 240

export default FlutterPrivacyPage
