import { join } from "path"
import { AppMarkdown } from "@/components/app/app-markdown"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterPrivacyPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/privacy.md"),
    "utf-8",
  )

  return (
    <div className="flex justify-center py-8 min-h-screen">
      <div className="max-w-[container.sm] mx-auto w-full px-4 md:px-12">
        <AppMarkdown>{text}</AppMarkdown>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "プライバシー・ポリシー" },
}

export const revalidate = 240

export default FlutterPrivacyPage
