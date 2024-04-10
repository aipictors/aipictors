import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { AppFooter } from "@/[lang]/app/_components/app-footer"
import { AppMarkdown } from "@/_components/app/app-markdown"
import { AppPageCenter } from "@/_components/app/app-page-center"

export default function AppPrivacy() {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/privacy.md"),
    "utf-8",
  )
  
  return (
    <>
      <AppPageCenter>
        <div className="space-y-8 py-8">
          <h1 className="font-bold text-2xl">{"プライバシー・ポリシー"}</h1>
          <AppMarkdown>{text}</AppMarkdown>
        </div>
      </AppPageCenter>
      <AppFooter />
    </>
  )
}
