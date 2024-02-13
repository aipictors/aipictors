import { join } from "path"
import { AppMarkdown } from "@/components/app/app-markdown"
import { readFile } from "fs/promises"
import type { Metadata } from "next"

const FlutterTermsPage = async () => {
  const text = await readFile(
    join(process.cwd(), "assets/flutter/terms.md"),
    "utf-8",
  )

  return (
    <div className="py-8">
      <AppMarkdown>{text}</AppMarkdown>
    </div>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: { absolute: "利用規約" },
}

export const revalidate = 240

export default FlutterTermsPage
